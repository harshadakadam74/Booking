const Product = require("../models/Product");
const { generateProductSku, generateSkuCode } = require("../Utils/generateSku");

//CREATE PRODUCT
const createProduct = async (reqData, files) => {
    const file = files?.[0];
    if (!file?.path) throw new Error ("Product image required");

    const productSku = generateProductSku(reqData.title, reqData.brand);

    const price = Number(reqData.price);
    const discountedPrice = reqData.discountedPrice? Number(reqData.discountedPrice)
    :price;

    const discount = reqData.discount ?? 
    Math.round(((price - discountedPrice) / price) * 100 );

    const product = new Product({
        productSku,
        title: reqData.title,
        brand: reqData.brand,
        category: reqData.category,
        description: reqData.description,
        image: file.path,
        price,
        discountedPrice,
        discount,
        tag: reqData.tag,
        offers: reqData.offers ? JSON.parse(reqData.offers) : [],
    });

    return await product.save();
};

//GET ALL PRODUCTS
const getAllProducts = async () => {
    return await Product.find()
    .populate("ratings")
    .populate("reviews");
};

//GET BY CATEGORY ✅
const getProductByCategory = async (category) => {
    const normalized = category
    .trim()
    .replace(/[_\-\s]+/g, '[-_\\s]*');

    return await Product.find({
        category:{
            $regex: `^${normalized}$`,
            $options: 'i'
        }
    });
};

//FIND BY ID
const findProductById = async (id) => {
    const product = await Product.findById(id)
    .populate("ratings")
    .populate("reviews");

    if(!product) throw new Error("Product not found");
    return product;
};

//DELETE
const deleteProduct = async (id) => {
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    await Product.findByIdAndDelete(id);
    return { message: "Product deleted successfully" };
};

// RELATED PRODUCTS
const getRelatedProducts = async (id) => {
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    return await Product.find({
        _id: { $ne: id },
        category: product.category,
        brand: product.brand,
    }).limit(8);
};

// UPDATE PRODUCT
const updateProduct = async (productId, reqData, files) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    if(files?.[0]?.path){
        product.image = files[0].path;
    }

    product.title = reqData.title ?? product.title;
    product.brand = reqData.brand ?? product.brand;
    product.tag = reqData.tag ?? product.tag;
    product.category = reqData.category ?? product.category;
    product.description = reqData.description ?? product.description;
    product.price = reqData.price ?? product.price;
    product.discountedPrice = reqData.discountedPrice ?? product.discountedPrice;
    product.discount = reqData.discount ?? product.discount;

    if (reqData.offers){
        product.offers = JSON.parse(reqData.offers);
    }

    if (reqData.skus){
        const skus = JSON.parse(reqData.skus);
        product.skus = skus.map((s) => {
            const discountedPrice = s.discountedPrice ?? s.price;
            const discount = 
            s.discount ??
            Math.round(((s.price - discountedPrice) / s.price) * 100);

            return {
                ...s,
                skucode: generateSkuCode(product.productSku, s.weight),
                discountedPrice,
                discount,
            };
        });
    }

    return await product.save();
};

//HOT DEALS
const getHotDeals = async (limit = 10) => {
    return await Product.find({ discount: { $gt:0 } })
    .sort({ discount: -1 })
    .limit(Number(limit))
    .select("title brand category image price discountedPrice discount skus");
};

module.exports = {
    createProduct,
    updateProduct,
    getAllProducts,
    getHotDeals,
    getProductByCategory,
    getRelatedProducts,
    findProductById,
    deleteProduct
}