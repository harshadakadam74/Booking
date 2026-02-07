const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/JWT.js')

const generateToken = (userId) => {
    return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'7d'});
}

const getUserIdFromToken = (token) => {
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    return decodedToken.userId;
}

module.exports = {generateToken,getUserIdFromToken}