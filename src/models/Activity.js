const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    // required: true - Made optional for Lead-based activities
  },
  type: {
    type: String,
    enum: ['Email', 'Call', 'Meeting', 'Contract Sent', 'Contract Signed', 'Note'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
