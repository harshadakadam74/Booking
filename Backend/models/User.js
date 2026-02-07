const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Enter your name"]
    },
    mobile:{
        type:Number,
        required:[true,"Enter your mobile number"]
    },
    email:{
        type:String,
        required:[true,"Enter your email"]
    },
    password:{
        type:String,
        required:[true,"Enter your password"]
    },
    role:{
        type:String,
        enum:['CUSTOMER','ADMIN'],
        default:'CUSTOMER'
    },
    photo:{
        type:String
    },
   resetPasswordToken:{
    type:String
   },
   resetPasswordExpires:{
    type:Date
   },
   createdAt:{
    type:Date,
    default:Date.now()
   },
})

const User = mongoose.model('users',userSchema);
module.exports = User;