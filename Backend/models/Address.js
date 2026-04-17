const mongoose = require ('mongoose');

const addressSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Please Enter Name']
    },
     surname:{
        type: String,
        required:[true, 'Please Enter Surname']
    },
     landmark:{
        type: String,
        required:[true, 'Please Enter Your Landmark']
    },
     city:{
        type: String,
        required:[true, 'Please Enter Your City']
    },
     state:{
        type: String,
        required:[true, 'Please Enter Your State  ']
    },
     pincode:{
        type: String,
        required:[true, 'Please Enter Your Pincode']
    },
     email:{
        type: String,
        required:[true, 'Please Enter Your Email']
    },
     mobile:{
        type: String,
        required:[true, 'Please Enter Your Mobile Number']
    },
     country:{
        type: String,
        required:[true, 'Please Enter Your Country']
    },
     user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },

},{ timestamps: true });

const Address = mongoose.model('addresses',addressSchema);

module.exports = Address;