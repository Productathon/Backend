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
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get action history (all activities across accounts)
// @route   GET /api/activities/history
// @access  Private
exports.getActionHistory = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('account', 'company')
      .sort({ date: -1 })
      .limit(50);

    // Map to frontend-expected format
    const mappedActivities = activities.map(activity => ({
      id: activity._id,
      company: activity.account?.company || 'Unknown Company',
      icon: activity.type === 'Call' ? 'call' : (activity.type === 'Email' ? 'mail' : 'business'),
      quote: activity.description || activity.title,
      date: new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      nextDate: null, // Placeholder
      status: activity.type.toUpperCase(),
      statusColor: '#3B82F6', // Default blue
      notes: activity.description
    }));

    res.status(200).json({ success: true, count: mappedActivities.length, data: mappedActivities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
