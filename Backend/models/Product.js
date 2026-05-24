const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productSku: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discount: { type: Number, required: true },
    offers: { type: Array, default: [] },
    tag: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.products || mongoose.model("products", productSchema);

module.exports = Product;