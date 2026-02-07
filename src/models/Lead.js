const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'closed'],
    default: 'new',
  },
  industry: {
    type: String,
    default: 'Technology',
  },
  location: {
    type: String,
    default: 'International',
  },
  companySize: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lead', LeadSchema);
