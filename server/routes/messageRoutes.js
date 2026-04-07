const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');

router.post('/', messageController.sendMessage);
router.get('/:roomID', messageController.getMessages);
module.exports = router;
