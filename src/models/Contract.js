const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Viewed', 'Signed', 'Rejected'],
    default: 'Draft'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    default: ''
  },
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  signature: {
    type: String, // Base64 encoded signature image
    default: null
  },
  sentAt: {
    type: Date
  },
  signedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contract', ContractSchema);
