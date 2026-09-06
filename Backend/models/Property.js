const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, default: 'Hotel', trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    totalRooms: { type: Number, required: true, min: 1 },
    availableRooms: { type: Number, required: true, min: 0 },
    amenities: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.pre('validate', function validateAvailability(next) {
  if (this.availableRooms > this.totalRooms) {
    return next(new Error('Available rooms cannot exceed total rooms'));
  }
  next();
});

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

module.exports = Property;