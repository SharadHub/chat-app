const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExits = await User.findOne({ email });

    if (userExits) {
      return res.status(400).json({ message: "User already exist" });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: "Server is not responding" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (user && user.password == password) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
      });
    } else {
        res.status(400).json({message: 'Invalid email or password'});
    }
  } catch (error) {
    es.status(500).json({ error: "Server is not responding" });
  }
};
