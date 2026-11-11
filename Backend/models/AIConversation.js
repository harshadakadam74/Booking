const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, trim: true, maxlength: 1200 },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  title: { type: String, required: true, trim: true, maxlength: 80 },
  language: { type: String, enum: ['auto', 'English', 'Hindi', 'Marathi'], default: 'auto' },
  messages: {
    type: [messageSchema],
    required: true,
    validate: (items) => items.length > 0 && items.length <= 50,
  },
}, { timestamps: true });

conversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.models.AIConversation
  || mongoose.model('AIConversation', conversationSchema);
