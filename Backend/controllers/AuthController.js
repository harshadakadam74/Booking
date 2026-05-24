const UserService = require('../services/UserService');
const JWT_PROVIDER = require('../config/JWT');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../config/email');

const register = async (req, res) => {
    try {
        const { firstname, lastname, email, mobile, password, confirmPassword } = req.body;

        // validate required fields
        if (!firstname || !lastname || !email || !mobile || !password || !confirmPassword) {
            return res.status(400).json({
                message: 'All fields are required',
            });
        }

        // Prepare user data for UserService (it expects `name`, `mobile`, `email`, `password`)
        const userData = {
            name: `${firstname} ${lastname}`.trim(),
            mobile,
            email: email.toLowerCase(),
            password,
        };

        // create user
        const user = await UserService.createUser(userData);

        // Generate Token
        const jwt = JWT_PROVIDER.generateToken(user._id);

        // Remove sensitive data
        if (user && user.password) user.password = undefined;

        return res.status(201).json({
            message: 'User registered successfully',
            jwt,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

const login = async (req,res) => {
    const {password,email} = req.body;

    try {
        let user;
        if(email) user = await UserService.findUserByEmail(email);
        if(!user) return res.status(404).send({message:'User not found'});

        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid) return res.status(401).send({message:'Invalid Passeord'});

        const jwt = JWT_PROVIDER.generateToken(user._id);
        user.password = undefined;

        return res.status(200).send({
            jwt,
            message:'Login successful',
            user
        });
    } 
    catch (error) 
    {
        return res.status(500).send({error:error.message});
    }
};

const logout = async (req,res) => {
    try {
        const result = await UserService.logoutUser();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message:error.message });
    };
};

//forgot password
const forgotPassword = async(req, res) => {
    const { email } = req.body;

    try {
        if(!email) return res.status(400).send({message:"Email is required"});

        const resetToken = await UserService.setResetPasswordToken(email);
        
        // send email with reset link
        const resetUrl = `http://localhost:4545/reset-password/${resetToken}`;
        const html = `<p>You requested a password reset </p>
                      <p>Click this link to reset your password:<a href="${resetUrl}">${resetUrl}</a></p>`;

        await sendEmail(email,'Reset Your password',html);
        
        return res.status(200).send({message:"Reset password link send to eamil"});

    } catch (error) {
        return res.status(500).send({error: error.message});
    };
};

// reset password
const resetPassword = async(req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
        if(!token || !newPassword || !confirmPassword) {
            return res.status(400).send({message:"Token and password id required"});
        }

        const user = await UserService.resetPassword(token, newPassword, confirmPassword);

        return res.status(200).send({ message: "Password reset successfully ", user});

    } catch (error) {
        return res.status(500).send({error: error.message});
    };
};


module.exports = { register , login , logout , forgotPassword , resetPassword};