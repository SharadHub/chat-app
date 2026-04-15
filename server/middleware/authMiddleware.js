const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization("")[1]; // SPLIT header and token
      const decoded = jwt.verify(process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ error: "User not found" });
    }
  }
  if(!token){
    res.status(401).json({message: "Not authorized"});
  }
};
