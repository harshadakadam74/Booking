const mongoose = require ("mongoose");

const productSchema = new mongoose({
    productSku: { type: String, unique: true, index:true },
    title: { type:String, required: true },
    brand: { type:String, required: true },
    category: { type:String, required: true },
    description: { type:String, required: true },
    image: { type:String, required: true },
    price: { type:String, required: true },
    discountedPrice: { type:String, required: true },
    discount: { type:String, required: true },
    offers: { type:String, required: true },
    tag:{
        type: String,
        required: true
    },
    // ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "ratings" }],
    // reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "reviews" }],
    // numRatings: { type: Number, default: 0 },
    // numReviews: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now},
});

const Product = mongoose.models.products || mongoose.model("products",productSchema);

module.exports = Product;