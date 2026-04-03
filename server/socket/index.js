const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');
const registerHandlers = require('./handlers');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Auth middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      
      // Get user details
      const user = await User.findById(decoded.userId);
      if (user) {
        socket.user = user;
      }
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);
    
    // Update user status to online
    User.findByIdAndUpdate(socket.userId, { status: 'online', lastSeen: new Date() }).exec();
    
    // Broadcast user online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.username
    });

    // Register all event handlers
    registerHandlers(io, socket);

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username}`);
      
      // Update user status to offline
      await User.findByIdAndUpdate(socket.userId, { 
        status: 'offline', 
        lastSeen: new Date() 
      });
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.username
      });
      
      // Leave all rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });
  });

  return io;
};

module.exports = initSocket;
