const UserService = require('../services/UserService');

const getAllUser = async (req, res) => {
    try {

        const users = await UserService.getAllUser();

        return res.status(200).send(users);

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
};

const getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send({ message: 'User not authenticated' });
        }

        return res.status(200).send(req.user);
    } catch (error) {
        return res.status(500).send(error.message);
    }
};

const updateProfile = async (req, res) => {
    try {

        const userId = req.user_id;
        const updateData = {...req.body};

        if (req.file){

            updateData.photo = req.file.path || req.file.filename;

        }

        for (let key in updateData) {

            if(updateData[key] === ''){
                updateData[key] = undefined;
            }

        }

        const updatedUser = await UserService.updateUserProfile(userId,updateData);

        res.status(200).json({
            message:'Profile updated successfully',
            user:updatedUser
        });

    } catch (error) {

        res.status(400).json({error:error.message});
        
    }
};

module.exports = {getAllUser, getUserProfile, updateProfile} 