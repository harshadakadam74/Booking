const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, trim: true, lowercase: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
    type: { type: String, required: true, trim: true },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    description: { type: String, default: '', maxlength: 1000 },
    image: { type: String, default: '' },
    aliases: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

destinationSchema.index({ normalizedName: 1 }, { unique: true });
destinationSchema.index({ state: 1, active: 1 });
destinationSchema.index({ aliases: 1 });

const Destination = mongoose.models.Destination ||
  mongoose.model('Destination', destinationSchema);

module.exports = Destination;
