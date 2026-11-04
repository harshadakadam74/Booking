const User = require('../models/User');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Property = require('../models/Property');
const mongoose = require('mongoose');
const ApiResponse = require('../Utils/ApiResponse');
const UserService = require('../services/UserService');
const {
  activeBookingStatuses,
  acquireBookingStatusLock,
  releasePropertyBookingLock,
} = require('../services/bookingInventory');

const validId = (id) => mongoose.Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
const escapedRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const statusValues = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'];

const validatePropertyInput = (body, existing) => {
  const fields = [
    'name', 'location', 'address', 'streetAddress', 'city', 'state', 'country', 'currency',
    'type', 'propertyType', 'description', 'image', 'images', 'price', 'totalRooms',
    'availableRooms', 'maxGuestsPerRoom', 'amenities', 'rating', 'ratingCount',
    'ratingSource', 'isVerified', 'isDemo', 'active',
  ];
  const values = {};
  fields.forEach((field) => {
    if (Object.hasOwn(body, field)) values[field] = body[field];
  });

  const name = values.name ?? existing?.name;
  const location = values.location ?? existing?.location;
  const price = values.price === undefined ? existing?.price : Number(values.price);
  const totalRooms = values.totalRooms === undefined ? existing?.totalRooms : Number(values.totalRooms);
  const availableRooms = values.availableRooms === undefined ? existing?.availableRooms : Number(values.availableRooms);

  for (const field of ['price', 'totalRooms', 'availableRooms', 'maxGuestsPerRoom', 'rating', 'ratingCount']) {
    if (values[field] !== undefined &&
      (values[field] === null || values[field] === '' || !Number.isFinite(Number(values[field])))) {
      return { error: `${field} must be a valid number.` };
    }
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120) {
    return { error: 'Hotel name must contain between 2 and 120 characters.' };
  }
  if (typeof location !== 'string' || location.trim().length < 2 || location.trim().length > 200) {
    return { error: 'Hotel location must contain between 2 and 200 characters.' };
  }
  if (!Number.isFinite(price) || price < 0 || price > 100000000) {
    return { error: 'Price must be a non-negative number.' };
  }
  if (!Number.isInteger(totalRooms) || totalRooms < 1 || totalRooms > 100000) {
    return { error: 'Total rooms must be a positive whole number.' };
  }
  if (!Number.isInteger(availableRooms) || availableRooms < 0 || availableRooms > totalRooms) {
    return { error: 'Available rooms must be a whole number between zero and total rooms.' };
  }
  if (values.type !== undefined &&
    (typeof values.type !== 'string' || values.type.trim().length < 2 || values.type.trim().length > 60)) {
    return { error: 'Hotel type must contain between 2 and 60 characters.' };
  }
  for (const field of ['address', 'streetAddress', 'city', 'state', 'country', 'propertyType', 'ratingSource']) {
    if (values[field] !== undefined &&
      (typeof values[field] !== 'string' ||
        values[field].trim().length > (['address', 'streetAddress'].includes(field) ? 250 : 100))) {
      return { error: `${field} must be a valid string.` };
    }
  }
  if (values.currency !== undefined &&
    (typeof values.currency !== 'string' || !/^[A-Za-z]{3}$/.test(values.currency.trim()))) {
    return { error: 'Currency must be a three-letter currency code.' };
  }
  if (values.propertyType !== undefined &&
    (typeof values.propertyType !== 'string' || values.propertyType.trim().length < 2 || values.propertyType.trim().length > 60)) {
    return { error: 'Property type must contain between 2 and 60 characters.' };
  }
  if (values.description !== undefined &&
    (typeof values.description !== 'string' || values.description.length > 4000)) {
    return { error: 'Description cannot exceed 4000 characters.' };
  }
  if (values.image !== undefined) {
    if (typeof values.image !== 'string' || values.image.length > 2048) {
      return { error: 'Image must be a valid public URL.' };
    }
    if (values.image.trim()) {
      try {
        const url = new URL(values.image);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
      } catch {
        return { error: 'Image must be a valid HTTP or HTTPS URL.' };
      }
    }
  }
  if (values.amenities !== undefined &&
    (!Array.isArray(values.amenities) || values.amenities.length > 40 ||
      values.amenities.some((item) => typeof item !== 'string' || !item.trim() || item.trim().length > 60))) {
    return { error: 'Amenities must be a list of up to 40 non-empty strings (60 characters maximum each).' };
  }
  if (values.images !== undefined &&
    (!Array.isArray(values.images) || values.images.length > 20 ||
      values.images.some((image) => typeof image !== 'string' || image.length > 2048))) {
    return { error: 'Images must be a list of up to 20 public URLs.' };
  }
  if (values.images?.some((image) => {
    if (!image.trim()) return false;
    try {
      return !['http:', 'https:'].includes(new URL(image).protocol);
    } catch {
      return true;
    }
  })) return { error: 'Images must contain valid HTTP or HTTPS URLs.' };
  if (values.maxGuestsPerRoom !== undefined &&
    (!Number.isInteger(Number(values.maxGuestsPerRoom)) || Number(values.maxGuestsPerRoom) < 1 || Number(values.maxGuestsPerRoom) > 20)) {
    return { error: 'Maximum guests per room must be a whole number between 1 and 20.' };
  }
  if (values.rating !== undefined &&
    (Number(values.rating) < 0 || Number(values.rating) > 5)) {
    return { error: 'Rating must be between 0 and 5.' };
  }
  if (values.ratingCount !== undefined &&
    (!Number.isInteger(Number(values.ratingCount)) || Number(values.ratingCount) < 0)) {
    return { error: 'Rating count must be a non-negative whole number.' };
  }
  for (const field of ['isVerified', 'isDemo']) {
    if (values[field] !== undefined && typeof values[field] !== 'boolean') {
      return { error: `${field} must be true or false.` };
    }
  }
  if (values.active !== undefined && typeof values.active !== 'boolean') {
    return { error: 'Active status must be true or false.' };
  }

  const updates = {};
  Object.entries(values).forEach(([field, value]) => {
    if (['price', 'totalRooms', 'availableRooms', 'maxGuestsPerRoom', 'rating', 'ratingCount'].includes(field)) updates[field] = Number(value);
    else if (['name', 'location', 'address', 'streetAddress', 'city', 'state', 'country', 'currency', 'type', 'propertyType', 'description', 'image', 'ratingSource'].includes(field) && typeof value === 'string') {
      updates[field] = value.trim();
    } else if (field === 'amenities') updates.amenities = value.map((item) => item.trim());
    else if (field === 'images') updates.images = value.map((item) => item.trim());
    else updates[field] = value;
  });
  if (existing) {
    updates.price = price;
    updates.totalRooms = totalRooms;
    updates.availableRooms = availableRooms;
  }
  return { updates };
};

const getPagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 100));
  return { page, limit, skip: (page - 1) * limit };
};

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalHotels,
      activeHotels,
      inactiveHotels,
      pendingHotelApprovals,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      revenueRows,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ active: { $ne: false } }),
      Property.countDocuments({ active: false }),
      Property.countDocuments({ approvalStatus: 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'PENDING' }),
      Booking.countDocuments({ bookingStatus: 'CONFIRMED' }),
      Booking.countDocuments({ bookingStatus: 'CANCELLED' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Booking.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8).lean(),
      User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    return ApiResponse.success(res, {
      metrics: {
        totalUsers,
        totalHotels,
        activeHotels,
        inactiveHotels,
        pendingHotelApprovals,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        paidRevenue: revenueRows[0]?.total || 0,
      },
      recentBookings,
      recentUsers,
    }, 'Admin dashboard loaded successfully');
  } catch (error) {
    console.error('Admin dashboard query failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to load admin dashboard.');
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120 ||
      typeof mobile !== 'string' || mobile.trim().length < 5 || mobile.trim().length > 30 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8) {
      return ApiResponse.error(res, 400, 'Enter a valid name, mobile, email, and password of at least 8 characters.');
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
    if (req.query.status && !['active', 'inactive'].includes(req.query.status)) {
      return ApiResponse.error(res, 400, 'Status must be active or inactive.');
    }
    if (req.query.approvalStatus && !['pending', 'approved', 'rejected'].includes(req.query.approvalStatus)) {
      return ApiResponse.error(res, 400, 'Approval status must be pending, approved, or rejected.');
    }
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const city = typeof req.query.city === 'string' ? req.query.city.trim().slice(0, 100) : '';
    if (search) {
      const regex = new RegExp(escapedRegex(search), 'i');
      filter.$or = [{ name: regex }, { location: regex }];
    }
    if (city) filter.location = new RegExp(escapedRegex(city), 'i');
    if (req.query.status === 'active') filter.active = { $ne: false };
    if (req.query.status === 'inactive') filter.active = false;
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;

    const [properties, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);
    return ApiResponse.success(res, {
      properties,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, 'Properties fetched successfully');
  } catch (error) {
    console.error('Admin hotel listing failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to load hotels.');
  }
};

const createProperty = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { updates, error } = validatePropertyInput(req.body);
    if (error) return ApiResponse.error(res, 400, error);
    if (!updates.name || !updates.location || updates.price === undefined ||
      updates.totalRooms === undefined || updates.availableRooms === undefined) {
      return ApiResponse.error(res, 400, 'Name, location, price, total rooms and available rooms are required.');
    }
    const hasLatitude = latitude !== undefined && latitude !== '';
    const hasLongitude = longitude !== undefined && longitude !== '';
    if (hasLatitude !== hasLongitude) {
      return ApiResponse.error(res, 400, 'Latitude and longitude must be supplied together as valid coordinates.');
    }
    const hasCoordinates = hasLatitude && hasLongitude;
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    if (hasCoordinates && (
      !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90 ||
      !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180
    )) {
      return ApiResponse.error(res, 400, 'Latitude and longitude must be supplied together as valid coordinates.');
    }

    const property = await Property.create({
      ...updates,
      type: updates.type || 'Hotel',
      description: updates.description || '',
      image: updates.image || '',
      amenities: updates.amenities || [],
      images: updates.images || (updates.image ? [updates.image] : []),
      city: updates.city || updates.location.split(',')[0].trim(),
      country: updates.country || 'India',
      propertyType: updates.propertyType || updates.type || 'Hotel',
      listingSource: 'admin',
      approvalStatus: 'approved',
      active: updates.active ?? true,
      ...(hasCoordinates ? { geoLocation: { type: 'Point', coordinates: [parsedLongitude, parsedLatitude] } } : {}),
    });

    return ApiResponse.success(res, { property }, 'Hotel created successfully', 201);
  } catch (error) {
    return ApiResponse.error(res, 400, error.message);
  }
};

const updateProperty = async (req, res) => {
  try {
    if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid hotel ID.');
    const property = await Property.findById(req.params.id);
    if (!property) return ApiResponse.error(res, 404, 'Hotel not found');

    const { latitude, longitude } = req.body;
    const { updates, error } = validatePropertyInput(req.body, property);
    if (error) return ApiResponse.error(res, 400, error);
    const hasLatitude = latitude !== undefined && latitude !== '';
    const hasLongitude = longitude !== undefined && longitude !== '';
    if (hasLatitude !== hasLongitude) {
      return ApiResponse.error(res, 400, 'Latitude and longitude must be supplied together.');
    }
    if (hasLatitude && hasLongitude) {
      const parsedLatitude = Number(latitude);
      const parsedLongitude = Number(longitude);
      if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90 ||
        !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
        return ApiResponse.error(res, 400, 'Latitude and longitude must be valid coordinates.');
      }
      property.geoLocation = { type: 'Point', coordinates: [parsedLongitude, parsedLatitude] };
    }
    Object.assign(property, updates);
    await property.save();

    return ApiResponse.success(res, { property }, 'Hotel updated successfully');
  } catch (error) {
    console.error('Admin hotel update failed:', error.message);
    return ApiResponse.error(res, 400, 'Unable to update hotel. Check the submitted fields.');
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid hotel ID.');
    if (typeof req.body?.active !== 'boolean') {
      return ApiResponse.error(res, 400, 'Active status must be true or false.');
    }
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { active: req.body.active } },
      { new: true, runValidators: true },
    );
    if (!property) return ApiResponse.error(res, 404, 'Hotel not found.');
    return ApiResponse.success(res, { property }, 'Hotel status updated successfully.');
  } catch (error) {
    console.error('Admin hotel status update failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to update hotel status.');
  }
};

const updatePropertyApprovalStatus = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid hotel ID.');
  const { approvalStatus } = req.body || {};
  if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
    return ApiResponse.error(res, 400, 'Approval status must be pending, approved, or rejected.');
  }
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          approvalStatus,
          active: approvalStatus === 'approved',
        },
      },
      { new: true, runValidators: true }
    );
    if (!property) return ApiResponse.error(res, 404, 'Hotel not found.');
    return ApiResponse.success(res, { property }, 'Hotel approval status updated.');
  } catch (error) {
    console.error('Admin hotel approval update failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to update hotel approval status.');
  }
};

const deleteProperty = async (req, res) => {
  try {
    if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid hotel ID.');
    const property = await Property.findById(req.params.id);
    if (!property) return ApiResponse.error(res, 404, 'Hotel not found');

    const existingBooking = await Booking.exists({
      $or: [{ propertyId: property._id }, { property: property.name }],
    });
    if (existingBooking) {
      property.active = false;
      await property.save();
      return ApiResponse.success(res, {
        property,
        deactivated: true,
      }, 'Hotel has booking history and was deactivated instead of deleted.');
    }

    await property.deleteOne();
    return ApiResponse.success(res, { deactivated: false }, 'Hotel deleted successfully.');
  } catch (error) {
    console.error('Admin hotel deletion failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to safely delete hotel.');
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const filter = search ? {
      $or: [
        { name: new RegExp(escapedRegex(search), 'i') },
        { email: new RegExp(escapedRegex(search), 'i') },
      ],
    } : {};
    const [users, total] = await Promise.all([
      User.find(filter).select('name firstname lastname email mobile role createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return ApiResponse.success(res, {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, 'Users fetched successfully');
  } catch (error) {
    console.error('Admin user listing failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to load users.');
  }
};

const setUserRole = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid user ID.');
  const { role } = req.body || {};
  if (!['CUSTOMER', 'OWNER'].includes(role)) {
    return ApiResponse.error(res, 400, 'Role must be CUSTOMER or OWNER.');
  }
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return ApiResponse.error(res, 404, 'User not found.');
    if (user.role === 'ADMIN') return ApiResponse.error(res, 409, 'Administrator role cannot be changed here.');
    user.role = role;
    await user.save();
    return ApiResponse.success(res, { user }, 'User role updated.');
  } catch (error) {
    console.error('Admin user role update failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to update user role.');
  }
};

const getAllBookings = async (req, res) => {
  try {
    if (req.query.status && !statusValues.includes(req.query.status)) {
      return ApiResponse.error(res, 400, 'Invalid booking status.');
    }
    if ((req.query.from && Number.isNaN(Date.parse(req.query.from))) ||
      (req.query.to && Number.isNaN(Date.parse(req.query.to)))) {
      return ApiResponse.error(res, 400, 'Booking date filters must be valid dates.');
    }
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (statusValues.includes(req.query.status)) filter.bookingStatus = req.query.status;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from && !Number.isNaN(Date.parse(req.query.from))) {
        filter.createdAt.$gte = new Date(req.query.from);
      }
      if (req.query.to && !Number.isNaN(Date.parse(req.query.to))) {
        const endDate = new Date(req.query.to);
        if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.to)) {
          endDate.setUTCHours(23, 59, 59, 999);
        }
        filter.createdAt.$lte = endDate;
      }
      if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
    }
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    if (search) {
      const regex = new RegExp(escapedRegex(search), 'i');
      const conditions = [
        { property: regex },
        { guestName: regex },
        { guestEmail: regex },
      ];
      if (validId(search)) conditions.push({ _id: new mongoose.Types.ObjectId(search) });
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }],
      }).select('_id').limit(100).lean();
      if (matchingUsers.length) conditions.push({ user: { $in: matchingUsers.map((user) => user._id) } });
      filter.$or = conditions;
    }
    const [bookings, total] = await Promise.all([
      Booking.find(filter).populate('user', 'name email mobile').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(filter),
    ]);
    return ApiResponse.success(res, {
      bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, 'Bookings fetched successfully');
  } catch (error) {
    console.error('Admin booking listing failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to load bookings.');
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
    if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid user ID.');
    const user = await User.findById(req.params.id);
    if (!user) return ApiResponse.error(res, 404, 'User not found');
    if (user.role === 'ADMIN' || user._id.equals(req.user._id)) {
      return ApiResponse.error(res, 409, 'Administrator accounts cannot be deleted from this endpoint.');
    }
    if (await Booking.exists({ user: user._id })) {
      return ApiResponse.error(res, 409, 'This user has booking history and cannot be deleted.');
    }
    await user.deleteOne();
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
  let bookingLock;
  try {
    if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid booking ID.');
    const { bookingStatus } = req.body || {};
    if (!statusValues.includes(bookingStatus)) {
      return ApiResponse.error(res, 400, 'Provide a valid bookingStatus.');
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return ApiResponse.error(res, 404, 'Booking not found');
    const previousStatus = booking.bookingStatus;

    if (activeBookingStatuses.includes(bookingStatus)) {
      const inventory = await acquireBookingStatusLock(booking);
      bookingLock = inventory.bookingLock;
      if (inventory.error) return ApiResponse.error(res, 409, inventory.error);
    }

    if (bookingStatus === 'COMPLETED' && booking.checkOutDate > new Date()) {
      return ApiResponse.error(res, 409, 'A booking cannot be completed before its check-out date.');
    }
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: booking._id, bookingStatus: previousStatus },
      { $set: { bookingStatus } },
      { new: true }
    );
    if (!updatedBooking) {
      return ApiResponse.error(res, 409, 'The booking status changed. Refresh and try again.');
    }
    await updatedBooking.populate('user', 'name email mobile');

    return ApiResponse.success(res, { booking: updatedBooking }, 'Booking updated successfully');
  } catch (error) {
    console.error('Admin booking update failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to update booking status.');
  } finally {
    if (bookingLock) {
      try {
        await releasePropertyBookingLock(bookingLock.property._id, bookingLock.token);
      } catch (error) {
        console.error('Unable to release hotel booking lock:', error.message);
      }
    }
  }
};

module.exports = {
  validatePropertyInput,
  createAdmin,
  getDashboard,
  getAllProperties,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  updatePropertyApprovalStatus,
  deleteProperty,
  getAllUsers,
  setUserRole,
  getAllBookings,
  getAllProducts,
  deleteUser,
  deleteProduct,
  updateBookingStatus,
};
