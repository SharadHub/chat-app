const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { sender, content, room } = req.body;

    const newMessage = new Message({
      sender,
      content,
      room,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).populate(
      "sender",
      "username",
    );
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};
