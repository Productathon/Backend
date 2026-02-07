const Lead = require('../models/Lead');
const Account = require('../models/Account');

// @desc    Get all leads (optionally filter by status=new)
// @route   GET /api/leads
// @access  Public
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ status: 'new' }).sort({ matchScore: -1 }); // Priority sort
    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Convert a lead to an account
// @route   POST /api/leads/convert
// @access  Public
exports.convertLead = async (req, res) => {
  const { leadId } = req.body;

  try {
    // 1. Find the lead
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    if (lead.status === 'converted') {
      return res.status(400).json({ success: false, error: 'Lead already converted' });
    }

    // 2. Update lead status
    lead.status = 'converted';
    await lead.save();

    // 3. Create new Account
    const newAccount = await Account.create({
      company: lead.company,
      industry: 'Technology', // Defaulting for now, or could come from lead if available
      value: '$50,000', // Default starting value
      owner: 'Rahul Sharma', // Assigned to current user
      status: 'Active'
    });

    res.status(200).json({
      success: true,
      data: { lead, account: newAccount },
      message: 'Lead converted successfully'
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
