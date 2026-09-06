const jwt = require("jsonwebtoken");

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    getSecret(),
    { expiresIn: "7d" }
  );
};

const getUserIdFromToken = (token) => {
  const decoded = jwt.verify(token, getSecret());
  return decoded.userId;
};

module.exports = {
  generateToken,
  getUserIdFromToken,
};