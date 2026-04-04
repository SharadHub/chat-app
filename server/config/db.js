const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/chat-app-db');
        console.log(`MongoDB connected ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error while connecting to database ${error.message}`);
        process.exit(1); // kill the process if error occurs
    }
}
module.exports = connectDB; // export this file logic so other file can use it. 
