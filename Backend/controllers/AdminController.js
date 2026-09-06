const User = require('../models/User');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Property = require('../models/Property');
const ApiResponse = require('../Utils/ApiResponse');
const UserService = require('../services/UserService');

const createAdmin = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
      return ApiResponse.error(res, 400, 'Name, mobile, email and password are required');
    }

    const user = await UserService.createUser({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'ADMIN',
    });

    user.password = undefined;
    return ApiResponse.success(res, { user }, 'Admin created successfully');
  } catch (error) {
    const statusCode = error.message.includes('already exists') ? 409 : 400;
    return ApiResponse.error(res, statusCode, error.message);
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    return ApiResponse.success(res, { properties }, 'Properties fetched successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const createProperty = async (req, res) => {
  try {
    const {
      name,
      location,
      type = 'Hotel',
      description = '',
      image = '',
      price,
      totalRooms,
      availableRooms,
      amenities = [],
    } = req.body;

    if (!name || !location || price === undefined || totalRooms === undefined || availableRooms === undefined) {
      return ApiResponse.error(res, 400, 'Name, location, price, total rooms and available rooms are required');
    }

    const property = await Property.create({
      name,
      location,
      type,
      description,
      image,
      price: Number(price),
      totalRooms: Number(totalRooms),
      availableRooms: Number(availableRooms),
      amenities: Array.isArray(amenities) ? amenities : [],
    });

    return ApiResponse.success(res, { property }, 'Hotel created successfully', 201);
  } catch (error) {
    return ApiResponse.error(res, 400, error.message);
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return ApiResponse.error(res, 404, 'Hotel not found');

    const { availableRooms, totalRooms, active } = req.body;
    if (availableRooms !== undefined) property.availableRooms = Number(availableRooms);
    if (totalRooms !== undefined) property.totalRooms = Number(totalRooms);
    if (active !== undefined) property.active = Boolean(active);
    await property.save();

    return ApiResponse.success(res, { property }, 'Hotel availability updated successfully');
  } catch (error) {
    return ApiResponse.error(res, 400, error.message);
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return ApiResponse.error(res, 404, 'Hotel not found');
    return ApiResponse.success(res, null, 'Hotel deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

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

module.exports = {
  createAdmin,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getAllUsers,
  getAllBookings,
  getAllProducts,
  deleteUser,
  deleteProduct,
  updateBookingStatus,
};
