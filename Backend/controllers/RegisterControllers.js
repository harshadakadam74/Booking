const AuthController = require('./AuthController');

const registerUser = async (req, res) => {
  return AuthController.register(req, res);
};

module.exports = { registerUser };
