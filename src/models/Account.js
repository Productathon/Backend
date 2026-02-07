const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  value: {
    type: String, // Storing as string to keep currency formatting simple for now
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Dormant', 'Closed'],
    default: 'Active',
  },
  lastInteraction: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Account', AccountSchema);
