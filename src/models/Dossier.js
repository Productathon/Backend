const mongoose = require('mongoose');

const DossierSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['news', 'tender', 'signal'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Keeping as string to match frontend display format primarily
    required: true,
  },
  industry: {
    type: String,
    default: 'Technology',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Dossier', DossierSchema);
