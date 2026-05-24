const ProductService = require('../services/ProductService');

const createProduct = async (req, res) => {
  try {
    const product = await ProductService.createProduct(req.body, req.files);
    return res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    return res.status(200).json({ message: 'Products fetched successfully', products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const products = await ProductService.getProductByCategory(req.params.category);
    return res.status(200).json({ message: 'Products fetched successfully', products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await ProductService.findProductById(req.params.productId);
    return res.status(200).json({ message: 'Product fetched successfully', product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await ProductService.updateProduct(req.params.productId, req.body, req.files);
    return res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await ProductService.deleteProduct(req.params.productId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getHotDeals = async (req, res) => {
  try {
    const products = await ProductService.getHotDeals();
    return res.status(200).json({ message: 'Hot deals fetched successfully', products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
  getHotDeals,
};
