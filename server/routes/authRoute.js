const express = require('express');
const router = express.Router();

const { register, login } = require('../controller/authController');

router('/register', register);
router('/login', login);

module.exports = router;