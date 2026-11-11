const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, required: true, maxlength: 80 },
  activity: { type: String, required: true, maxlength: 400 },
  estimatedCost: { type: Number, required: true, min: 0 },
}, { _id: false });

const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true, min: 1, max: 14 },
  activities: { type: [activitySchema], required: true, validate: (activities) => activities.length > 0 && activities.length <= 8 },
  budgetTip: { type: String, required: true, maxlength: 400 },
}, { _id: false });

const tripPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
  destination: { type: String, required: true, trim: true, maxlength: 100 },
  days: { type: Number, required: true, min: 1, max: 14 },
  budget: { type: Number, required: true, min: 1, max: 100000000 },
  interests: { type: [String], default: [], validate: (items) => items.length <= 12 },
  language: { type: String, enum: ['English', 'Hindi', 'Marathi'], default: 'English' },
  itinerary: {
    title: { type: String, required: true, maxlength: 150 },
    days: { type: [itineraryDaySchema], required: true },
  },
  notice: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

tripPlanSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.models.TripPlan || mongoose.model('TripPlan', tripPlanSchema);
