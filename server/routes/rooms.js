const express = require('express');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all rooms
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'username avatar status')
      .populate('members', 'username avatar status')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const room = new Room({
      name,
      description,
      type: type || 'public',
      createdBy: req.userId,
      members: [req.userId]
    });

    await room.save();
    await room.populate('createdBy', 'username avatar status');
    await room.populate('members', 'username avatar status');

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join room
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.members.includes(req.userId)) {
      room.members.push(req.userId);
      await room.save();
    }

    await room.populate('members', 'username avatar status');
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave room
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.members = room.members.filter(
      memberId => memberId.toString() !== req.userId
    );
    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
