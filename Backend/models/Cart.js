const mangoose = require("mangoose");
const { default: mongoose } = require("mongoose");

const cartScheme = new mangoose.scheme(
    {
        user:{
            type: mangoose.scheme.Types.ObjectId,
            ref:"users",
            required:true,
            unique:true,
        },

        totalPrice:{
            type:Number,
            default:0,
        },
        
         totalPayable:{
            type:Number,
            default:0,
        },

         totalItem:{
            type:Number,
            default:0,
        },

        discount:{
            type:Number,
            default:0,
        },
    },
    {timestamps:true}
);

const Cart = mongoose.model("cart", cartScheme);
module.exports = Cart