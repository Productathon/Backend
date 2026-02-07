const Dossier = require('../models/Dossier');

// @desc    Get all dossiers
// @route   GET /api/dossiers
// @access  Public
exports.getDossiers = async (req, res) => {
  try {
    const dossiers = await Dossier.find().sort({ date: -1 }); // Sort by date descending
    res.status(200).json({ success: true, count: dossiers.length, data: dossiers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
