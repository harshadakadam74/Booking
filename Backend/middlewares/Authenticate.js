const JWT_PROVIDER = require('../config/JWT')
const UserService = require('../services/UserService')

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        // If User Not Pass Generated Token Throw Error
        if(!token) return res.status(401).json({ message: "Token Not Found" });

        const userId = JWT_PROVIDER.getUserIdFromToken(token);

        const user = await UserService.findUserById(userId);

        // if user is not found
        if(!user) return res.status(401).json({ message: " User not found" });

        req.user = user;

        next();

    } catch (error) {
        
        return res.status(401).json({ message: "Invalid or expired token" });

    }
};

module.exports = {authenticate};