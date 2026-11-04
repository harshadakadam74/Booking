const mongoose = require('mongoose');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const ApiResponse = require('../Utils/ApiResponse');
const { validatePropertyInput } = require('./AdminController');

const editableFields = [
  'name', 'location', 'address', 'streetAddress', 'city', 'state', 'country', 'currency',
  'type', 'propertyType', 'description', 'image', 'images', 'price', 'totalRooms',
  'availableRooms', 'maxGuestsPerRoom', 'amenities',
];
const validId = (id) => mongoose.Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);

const validateOwnerInput = (body, existing) => {
  const allowed = Object.fromEntries(
    editableFields.filter((field) => Object.hasOwn(body || {}, field))
      .map((field) => [field, body[field]])
  );
  const { updates, error } = validatePropertyInput(allowed, existing);
  if (error) return { error };
  if (!updates.name || !updates.location || updates.price === undefined ||
    updates.totalRooms === undefined || updates.availableRooms === undefined) {
    return { error: 'Name, location, price, total rooms, and available rooms are required.' };
  }
  return { updates };
};

const listOwnProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id }).sort({ updatedAt: -1 }).lean();
    return ApiResponse.success(res, { properties }, 'Your property listings loaded.');
  } catch (error) {
    console.error('Owner property listing failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to load your property listings.');
  }
};

const submitProperty = async (req, res) => {
  const { updates, error } = validateOwnerInput(req.body);
  if (error) return ApiResponse.error(res, 400, error);
  try {
    const property = await Property.create({
      ...updates,
      city: updates.city || updates.location.split(',')[0].trim(),
      country: updates.country || 'India',
      type: updates.type || updates.propertyType || 'Hotel',
      propertyType: updates.propertyType || updates.type || 'Hotel',
      images: updates.images || (updates.image ? [updates.image] : []),
      amenities: updates.amenities || [],
      active: true,
      approvalStatus: 'pending',
      ownerId: req.user._id,
      listingSource: 'owner',
      isDemo: false,
      isVerified: false,
    });
    return ApiResponse.success(res, { property }, 'Property submitted for administrator approval.', 201);
  } catch (requestError) {
    console.error('Owner property submission failed:', requestError.message);
    return ApiResponse.error(res, 400, 'Unable to submit property. Check the listing details.');
  }
};

const updateOwnProperty = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid property ID.');
  try {
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!property) return ApiResponse.error(res, 404, 'Property listing not found.');
    const { updates, error } = validateOwnerInput(req.body, property);
    if (error) return ApiResponse.error(res, 400, error);
    Object.assign(property, updates, {
      approvalStatus: 'pending',
      isVerified: false,
      listingSource: 'owner',
    });
    await property.save();
    return ApiResponse.success(res, { property }, 'Listing updated and sent for approval.');
  } catch (error) {
    console.error('Owner property update failed:', error.message);
    return ApiResponse.error(res, 400, 'Unable to update property listing.');
  }
};

const setOwnPropertyStatus = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid property ID.');
  if (typeof req.body?.active !== 'boolean') {
    return ApiResponse.error(res, 400, 'Active status must be true or false.');
  }
  try {
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!property) return ApiResponse.error(res, 404, 'Property listing not found.');
    if (req.body.active && property.approvalStatus !== 'approved') {
      return ApiResponse.error(res, 409, 'A listing must be approved before it can be activated.');
    }
    property.active = req.body.active;
    await property.save();
    return ApiResponse.success(res, { property }, 'Property status updated.');
  } catch (error) {
    console.error('Owner property status update failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to update property status.');
  }
};

const deleteOwnProperty = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid property ID.');
  try {
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!property) return ApiResponse.error(res, 404, 'Property listing not found.');
    const hasBookings = await Booking.exists({
      $or: [
        { propertyId: property._id },
        { property: property.name, propertyId: { $exists: false } },
      ],
    });
    if (hasBookings) {
      property.active = false;
      property.approvalStatus = 'rejected';
      await property.save();
      return ApiResponse.success(res, { property, deactivated: true }, 'Booking history exists; listing deactivated instead of deleted.');
    }
    await property.deleteOne();
    return ApiResponse.success(res, { deactivated: false }, 'Property listing deleted.');
  } catch (error) {
    console.error('Owner property deletion failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to safely delete property listing.');
  }
};

module.exports = {
  listOwnProperties,
  submitProperty,
  updateOwnProperty,
  setOwnPropertyStatus,
  deleteOwnProperty,
};
