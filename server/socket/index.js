const { Server } = require('socket.io');

const initSocket = (socket) => {
    const io = new Server(socket,{
        cors:{
            origin: 'http://localhost:3000',
            methods: ["GET", "METHOD"]
        }
    });
    // connection event
    io.on('connect', (socket) => {
        console.log("A user is connected", socket.id);

        // joining room
        socket.on('joining-room', (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        // sending message
        socket.on('sending-message', (data) => {
            io.to(data.roomId).emit("Received message", data);
        });

        // disconnect
        socket.on('disconnect', () => {
            console.log("User is disconnected");
        });
    });
    return io;
};

module.exports = initSocket;