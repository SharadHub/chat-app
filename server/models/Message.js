import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    content: {
        type: String,
        trim: [true, 'Message cannot be empty'],
        required: true
    },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Message', MessageSchema);
