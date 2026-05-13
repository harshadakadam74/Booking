const User = require("../models/User");
const bcrypt = require("bcrypt");
const JWT_PROVIDER = require("../config/JWT");
const crypto = require("crypto");

const createUser = async (userData) => {
  try {
    let { name, mobile, email, password, role, photo } = userData;

    if (role && !["CUSTOMER", "ADMIN"].includes(role)) {
      throw new Error("Invalis role");
    }

    role = role || "CUSTOMER";

    const isExists = await User.findOne({ email });

    if (isExists) {
      throw new Error("User already exists with this email");
    }

    //hash password
    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedpassword,
      role,
      photo,
    });

    return user;
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user || null;
  } catch (error) {
    console.error("Error finding user by email: ", error.message);
    throw new Error(error.message);
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserProfile = async (token) => {
  try {
    const userId = JWT_PROVIDER.getUserIdFromToken(token);
    const user = await findUserById(userId);

    if (!user) {
      throw new Error("Account not found");
    }

    return user;
  } catch (error) {
    throw new Error("Invalid Token or User not found");
  }
};

const updateUserProfile = async (userId, updateData) => {
  try {
    const allowedFields = ["name", "mobile", "email", "photo", "role"];
    const updates = {};

    for (const key of allowedFields) {
      if (key in updateData) {
        updates[key] = updateData[key];
      }
    }

    delete updates._id;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if(!updatedUser){
        throw new Error('User Not Found'); 
    }

    return updatedUser;
  } catch (error) {
    throw new Error (error.message)
  }
};

const logoutUser = async() => {
    try {
        return {message:'Login successful'};
    } catch (error) {
        throw new Error(error.message);
        
    }
};

const generateResetToken = () => crypto.randomBytes(20).toString('hex');

const setResetPasswordToken = async (email) => {
    const user = await User.findOne({email});
    if (!user) throw new Error("Email not found");

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save();
    return resetToken;
};

const resetPassword = async (token, newPassword, confirmPassword) => {
    const user = await User.findOne(
        {
            resetPasswordToken:token,
            resetPasswordExpires:{$gt:Date.now()}
        }
    );
    if (!user) throw new Error("Invalid or expired token");

    if (newPassword !== confirmPassword) throw new Error("Passwords do not match");

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.text(newPassword)) throw new Error("Password must have uppercase,number and symbol");

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return user;
}

module.exports = { createUser, findUserByEmail,getAllUsers,getUserProfile,updateUserProfile,logoutUser,setResetPasswordToken,resetPassword };
