const User = require('../models/User');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const ApiResponse = require('../Utils/ApiResponse');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires');
    return ApiResponse.success(res, { users }, 'Users fetched successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email mobile').sort({ createdAt: -1 });
    return ApiResponse.success(res, { bookings }, 'Bookings fetched successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return ApiResponse.success(res, { products }, 'Products fetched successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return ApiResponse.error(res, 404, 'User not found');
    await user.remove();
    return ApiResponse.success(res, null, 'User deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return ApiResponse.error(res, 404, 'Product not found');
    await product.remove();
    return ApiResponse.success(res, null, 'Product deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return ApiResponse.error(res, 404, 'Booking not found');

    const { bookingStatus, paymentStatus } = req.body;
    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    await booking.save();

    return ApiResponse.success(res, { booking }, 'Booking updated successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

module.exports = { getAllUsers, getAllBookings, getAllProducts, deleteUser, deleteProduct, updateBookingStatus };
