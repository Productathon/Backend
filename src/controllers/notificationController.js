const User = require('../models/User');

// @desc    Register FCM token
// @route   POST /api/notifications/register-token
// @access  Private
exports.registerToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ success: false, error: 'FCM token is required' });
    }

    // Update user's FCM token
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
