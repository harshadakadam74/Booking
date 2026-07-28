const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken } = require("../config/JWT");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      jwt: token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { login };