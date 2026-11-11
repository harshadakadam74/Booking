const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    streetAddress: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    normalizedCity: { type: String, default: '', trim: true, lowercase: true, index: true },
    state: { type: String, default: '', trim: true },
    normalizedState: { type: String, default: '', trim: true, lowercase: true, index: true },
    country: { type: String, default: 'India', trim: true },
    normalizedCountry: { type: String, default: '', trim: true, lowercase: true, index: true },
    currency: { type: String, default: 'INR', trim: true, uppercase: true, minlength: 3, maxlength: 3 },
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (coordinates) => !coordinates || coordinates.length === 2,
          message: 'GeoJSON coordinates must contain longitude and latitude',
        },
      },
    },
    type: { type: String, default: 'Hotel', trim: true },
    propertyType: { type: String, default: 'Hotel', trim: true },
    category: { type: String, default: 'Hotel', trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    totalRooms: { type: Number, required: true, min: 1 },
    availableRooms: { type: Number, required: true, min: 0 },
    maxGuestsPerRoom: { type: Number, default: 4, min: 1, max: 20 },
    amenities: { type: [String], default: [] },
    normalizedAmenities: { type: [String], default: [] },
    facilities: { type: [String], default: [] },
    roomTypes: {
      type: [{
        name: { type: String, required: true, trim: true, maxlength: 80 },
        price: { type: Number, min: 0 },
        maxGuests: { type: Number, min: 1, max: 20, default: 2 },
        totalRooms: { type: Number, min: 0, default: 0 },
        availableRooms: { type: Number, min: 0, default: 0 },
      }],
      default: [],
    },
    checkInTime: { type: String, default: '15:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    checkOutTime: { type: String, default: '11:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    workTripFriendly: { type: Boolean, default: false, index: true },
    rating: { type: Number, min: 0, max: 5, default: null },
    ratingCount: { type: Number, min: 0, default: 0 },
    ratingSource: { type: String, default: '' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false, index: true },
    listingSource: {
      type: String,
      enum: ['owner', 'authorized_api', 'admin', 'demo'],
      default: 'admin',
    },
    sourceProvider: { type: String, default: '' },
    externalListingId: { type: String, default: '' },
    bookingLock: {
      token: { type: String, default: undefined },
      expiresAt: { type: Date, default: undefined },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.index({ geoLocation: '2dsphere' });
propertySchema.index({ normalizedCity: 1, active: 1, approvalStatus: 1, price: 1 });
propertySchema.index({ normalizedState: 1, active: 1, approvalStatus: 1 });
propertySchema.index({ normalizedCountry: 1, active: 1, approvalStatus: 1 });
propertySchema.index({ name: 1, active: 1, approvalStatus: 1 });
propertySchema.index({ normalizedAmenities: 1, active: 1, approvalStatus: 1 });
propertySchema.index({ ownerId: 1, approvalStatus: 1, active: 1 });
propertySchema.index(
  { listingSource: 1, sourceProvider: 1, externalListingId: 1 },
  { unique: true, partialFilterExpression: { externalListingId: { $type: 'string', $gt: '' } } }
);

propertySchema.pre('validate', function normalizeSearchFields() {
  const normalize = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  if (!this.streetAddress && this.address) this.streetAddress = this.address;
  if (!this.address && this.streetAddress) this.address = this.streetAddress;
  if (!this.city && this.location) this.city = this.location.split(',')[0].trim();
  this.normalizedCity = normalize(this.city || this.location);
  this.normalizedState = normalize(this.state);
  this.normalizedCountry = normalize(this.country);
  this.normalizedAmenities = [...new Set((this.amenities || []).map(normalize).filter(Boolean))];
  if (!this.propertyType && this.type) this.propertyType = this.type;
  if (!this.type && this.propertyType) this.type = this.propertyType;
  if (!this.image && this.images?.length) this.image = this.images[0];
  if (!this.images?.length && this.image) this.images = [this.image];
});

propertySchema.pre('validate', function validateAvailability(next) {
  if (this.availableRooms > this.totalRooms) {
    return next(new Error('Available rooms cannot exceed total rooms'));
  }
  next();
});

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

module.exports = Property;