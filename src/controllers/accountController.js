const Account = require('../models/Account');

// @desc    Get all accounts
// @route   GET /api/accounts
// @access  Public
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: accounts.length, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Public
exports.getSingleAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    res.status(200).json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
