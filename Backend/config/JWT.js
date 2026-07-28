const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const getUserIdFromToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
};

module.exports = {
  generateToken,
  getUserIdFromToken,
};