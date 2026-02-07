const Contract = require('../models/Contract');
const Activity = require('../models/Activity');
const Account = require('../models/Account');
const crypto = require('crypto');

// @desc    Create a new contract and simulate sending
// @route   POST /api/contracts
// @access  Public
exports.createContract = async (req, res) => {
  try {
    // 1. Create Contract
    const token = crypto.randomBytes(20).toString('hex');
    
    const contract = await Contract.create({
      account: req.body.account,
      title: req.body.title,
      value: req.body.value,
      content: req.body.content,
      items: req.body.items || [], // Capture items
      token,
      status: 'Sent',
      sentAt: Date.now()
    });

    // 2. Log Activity: Contract Sent
    await Activity.create({
      account: req.body.account,
      type: 'Contract Sent',
      title: `Contract Sent: ${req.body.title}`,
      description: `Value: $${req.body.value.toLocaleString()} (${req.body.items?.length || 0} items)`,
      metadata: { contractId: contract._id, token }
    });

    res.status(201).json({
      success: true,
      data: contract,
      publicLink: `/contract/${token}` // Frontend will construct full URL
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get contract by token (Public)
// @route   GET /api/contracts/:token
// @access  Public
exports.getContractByToken = async (req, res) => {
  try {
    const contract = await Contract.findOne({ token: req.params.token }).populate('account');
    
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    // Update status to Viewed if it was Sent
    if (contract.status === 'Sent') {
      contract.status = 'Viewed';
      await contract.save();
    }

    res.status(200).json({ success: true, data: contract });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Sign contract
// @route   POST /api/contracts/:token/sign
// @access  Public
exports.signContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({ token: req.params.token });

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    if (contract.status === 'Signed') {
        return res.status(400).json({ success: false, error: 'Contract already signed' });
    }

    // 1. Update Contract
    contract.status = 'Signed';
    contract.signedAt = Date.now();
    
    if (req.body.signature) {
      contract.signature = req.body.signature;
    }
    
    await contract.save();

    // 2. Update Account
    const account = await Account.findById(contract.account);
    if (account) {
        account.status = 'Closed'; // Or whatever status means success
        // Potentially update value if needed
        await account.save();
    }

    // 3. Log Activity: Contract Signed
    await Activity.create({
      account: contract.account,
      type: 'Contract Signed',
      title: `Contract Signed: ${contract.title}`,
      description: `Value: $${contract.value}`,
      metadata: { contractId: contract._id }
    });

    res.status(200).json({ success: true, data: contract });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
