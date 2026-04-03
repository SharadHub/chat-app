const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');

const registerHandlers = (io, socket) => {
  // Join a room
  socket.on('join_room', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      socket.join(roomId);
      socket.currentRoom = roomId;
      
      // Notify other users in room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });

      // Send recent messages to the joining user
      const messages = await Message.find({ room: roomId })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(50);

      socket.emit('room_messages', messages.reverse());
      
      console.log(`${socket.username} joined room: ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Leave a room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user_left', {
      userId: socket.userId,
      username: socket.username,
      roomId
    });
    socket.currentRoom = null;
    console.log(`${socket.username} left room: ${roomId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { roomId, content, type, fileUrl } = data;

      // Save message to database
      const message = new Message({
        room: roomId,
        sender: socket.userId,
        content,
        type: type || 'text',
        fileUrl: fileUrl || ''
      });

      await message.save();
      await message.populate('sender', 'username avatar');

      // Broadcast to room
      io.to(roomId).emit('new_message', message);
      
      console.log(`Message from ${socket.username} in room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('typing', {
      userId: socket.userId,
      username: socket.username,
      roomId,
      isTyping
    });
  });

  // Mark message as read
  socket.on('mark_read', async (data) => {
    try {
      const { messageId } = data;
      
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: {
          readBy: { user: socket.userId, readAt: new Date() }
        }
      });

      // Notify sender
      const message = await Message.findById(messageId);
      if (message) {
        io.to(message.room.toString()).emit('message_read', {
          messageId,
          userId: socket.userId,
          username: socket.username
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Get online users
  socket.on('get_online_users', async () => {
    try {
      const onlineUsers = await User.find({ status: 'online' })
        .select('username avatar status lastSeen');
      socket.emit('online_users', onlineUsers);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Private message (DM)
  socket.on('private_message', async (data) => {
    try {
      const { toUserId, content } = data;
      
      // Create a unique room ID for private chat
      const roomId = [socket.userId, toUserId].sort().join('_');
      
      socket.to(roomId).emit('private_message', {
        from: socket.userId,
        fromUsername: socket.username,
        content,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
};

module.exports = registerHandlers;
