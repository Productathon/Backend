const Activity = require('../models/Activity');

// @desc    Get activities for an account
// @route   GET /api/activities/:accountId
// @access  Public (for now, or Protected)
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ account: req.params.accountId }).sort({ date: -1 });
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Public
exports.createActivity = async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
