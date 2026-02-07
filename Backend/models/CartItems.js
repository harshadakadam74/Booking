const mongoose = require ("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        cart:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "cart",
            required: true,
        },

         user:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

         product:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true,
        },

         quantity:{
            type:Number,
            default:true,
        },

          price:{
            type:Number,
            required:true,
        },

          discountPrice:{
            type:Number,
            required:true,
        },

          discount:{
            type:Number,
            required:true,
        },

        image:{
            type:String,
        },

    },
    {timestamps:true}
);

const CartItem = mongoose.model("cartItems",cartItemSchema);
module.exports = CartItem