const Lead = require('../models/Lead');
const Account = require('../models/Account');

// @desc    Get all leads (optionally filter by status=new)
// @route   GET /api/leads
// @access  Public
exports.getLeads = async (req, res) => {
  try {
    const { 
      industry, 
      status, 
      minScore, 
      maxScore, 
      search, 
      confidence,
      companySize,
      location,
      lastUpdated,
      sort
    } = req.query;

    let query = {};

    // Industry Filter (comma-separated or single)
    if (industry) {
      const industries = industry.split(',');
      if (industries.length > 0) query.industry = { $in: industries };
    }

    // Status Filter
    if (status) {
      const statuses = status.split(',').map(s => s.toLowerCase());
      query.status = { $in: statuses };
    }

    // Score Range
    if (minScore || maxScore) {
      query.matchScore = {};
      if (minScore) query.matchScore.$gte = Number(minScore);
      if (maxScore) query.matchScore.$lte = Number(maxScore);
    }

    // Search (Company or Industry or Name)
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { company: searchRegex },
        { name: searchRegex },
        { industry: searchRegex }
      ];
    }

    // Confidence Level (derived from score usually, but if stored, query it)
    // For now assuming confidence maps to score ranges as per frontend logic
    if (confidence && confidence !== 'All') {
      if (confidence === 'High') {
        // High > 85
        query.matchScore = { ...query.matchScore, $gt: 85 };
      } else if (confidence === 'Medium') {
        // Medium 70-85
        query.matchScore = { ...query.matchScore, $gt: 70, $lte: 85 };
      } else if (confidence === 'Low') {
        // Low <= 70
        query.matchScore = { ...query.matchScore, $lte: 70 };
      }
    }

    // Company Size
    if (companySize && companySize !== 'All') {
      query.companySize = companySize;
    }

    // Location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Last Updated
    if (lastUpdated && lastUpdated !== 'All') {
      const today = new Date();
      let dateLimit = new Date();
      if (lastUpdated === 'Today') {
        dateLimit.setHours(0, 0, 0, 0);
      } else if (lastUpdated === 'Last 7 days') {
        dateLimit.setDate(today.getDate() - 7);
      } else if (lastUpdated === 'Last 30 days') {
        dateLimit.setDate(today.getDate() - 30);
      }
      query.lastUpdated = { $gte: dateLimit };
    }

    // Sorting
    let sortQuery = { matchScore: -1 }; // Default
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    }

    const leads = await Lead.find(query).sort(sortQuery);
    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Public
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.status(200).json({ success: true, data: lead });
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
      owner: ['Rahul Sharma', 'Sarah Jenkins', 'Mike Ross', 'Jessica Pearson'][Math.floor(Math.random() * 4)], 
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
// @desc    Generate a simulated lead (AI Agent Simulation)
// @route   POST /api/leads/generate
// @access  Public
exports.generateLead = async (req, res) => {
  try {
    const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Energy', 'Manufacturing'];
    const companies = ['Nexus', 'Apex', 'Vortex', 'Horizon', 'Quantum', 'Stellar', 'Pinnacle', 'Summit'];
    const suffixes = ['Corp', 'Inc', 'Solutions', 'Systems', 'Global', 'Tech', 'Labs'];
    
    // Generate realistic data
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const company = `${companies[Math.floor(Math.random() * companies.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${Math.floor(Math.random() * 99)}`;
    const score = Math.floor(Math.random() * (98 - 65) + 65);
    
    const newLead = await Lead.create({
      name: company, // Using company name as lead name for simplicity in this context
      company: company,
      industry: industry,
      email: `contact@${company.toLowerCase().replace(/\s/g, '')}.com`,
      phone: `+1-555-01${Math.floor(Math.random() * 99)}`,
      matchScore: score,
      status: 'new',
      createdAt: new Date()
    });

    res.status(201).json({ success: true, data: newLead });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate lead' });
  }
};
// @desc    Update lead status
// @route   PUT /api/leads/:id/status
// @access  Public
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    lead.status = status.toLowerCase();
    await lead.save();

    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Add feedback to a lead
// @route   POST /api/leads/:id/feedback
// @access  Public
exports.addLeadFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Add unique feedback items or replace entire array depending on requirement
    // Here we'll just replace/set the feedback array as per current UI flow
    lead.feedback = feedback; 
    await lead.save();

    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
