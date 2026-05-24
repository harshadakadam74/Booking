const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter your name"]
    },
    firstname:{
        type: String,
    },
    lastname:{
        type: String,
    },
     email:{
        type:String,
        required:[true,"Enter your email"]
    },
    mobile:{
        type:String,
        required:[true,"Enter your mobile number"]
    },
    password:{
        type:String,
        required:[true,"Enter your password"]
    },
    // removed duplicate/typo field 'conformpassword'
    role:{
        type:String,
        enum:['CUSTOMER','ADMIN'],
        default:'CUSTOMER'
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