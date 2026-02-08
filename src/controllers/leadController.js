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
    
    // Map leads to include frontend-expected intelligence fields
    const enrichedLeads = leads.map(lead => {
      // Compute intelligence fields based on matchScore and other data
      const confidenceScore = lead.matchScore;
      const urgencyLevel = lead.matchScore > 85 ? 'High' : (lead.matchScore > 70 ? 'Medium' : 'Low');
      
      return {
        id: lead._id,
        name: lead.company,
        match: lead.matchScore,
        status: lead.status.toUpperCase(),
        statusColor: lead.matchScore > 85 ? '#EF4444' : (lead.matchScore > 70 ? '#F59E0B' : '#94A3B8'),
        signal: 'Active',
        signalColor: '#DBEAFE',
        location: lead.location || 'Unknown',
        industry: lead.industry,
        lastContact: '1d ago', // Placeholder
        contact: lead.name,
        email: lead.email,
        phone: lead.phone || 'N/A',
        revenue: '$50M', // Placeholder
        employees: '500', // Placeholder
        confidenceScore,
        urgencyLevel,
        recommendedProduct: {
          name: 'Product Solution',
          justification: 'Based on industry and company size'
        },
        aiReportSummary: [
          'Lead analysis in progress',
          'Contact information verified',
          'Recommended for follow-up'
        ],
        // Keep original fields for compatibility
        _id: lead._id,
        company: lead.company,
        matchScore: lead.matchScore,
        createdAt: lead.createdAt,
        lastUpdated: lead.lastUpdated
      };
    });
    
    res.status(200).json({ success: true, count: enrichedLeads.length, data: enrichedLeads });
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

    // Enrich with intelligence fields
    const confidenceScore = lead.matchScore;
    const urgencyLevel = lead.matchScore > 85 ? 'High' : (lead.matchScore > 70 ? 'Medium' : 'Low');
    
    const enrichedLead = {
      id: lead._id,
      name: lead.company,
      match: lead.matchScore,
      status: lead.status.toUpperCase(),
      statusColor: lead.matchScore > 85 ? '#EF4444' : (lead.matchScore > 70 ? '#F59E0B' : '#94A3B8'),
      signal: 'Active',
      signalColor: '#DBEAFE',
      location: lead.location || 'Unknown',
      industry: lead.industry,
      lastContact: '1d ago',
      contact: lead.name,
      email: lead.email,
      phone: lead.phone || 'N/A',
      revenue: '$50M',
      employees: '500',
      confidenceScore,
      urgencyLevel,
      recommendedProduct: {
        name: 'Product Solution',
        justification: 'Based on industry and company size'
      },
      aiReportSummary: [
        'Lead analysis in progress',
        'Contact information verified',
        'Recommended for follow-up'
      ],
      _id: lead._id,
      company: lead.company,
      matchScore: lead.matchScore,
      createdAt: lead.createdAt,
      lastUpdated: lead.lastUpdated
    };

    res.status(200).json({ success: true, data: enrichedLead });
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
// Initialize services
const { sendNotification } = require('../services/notificationService');
const { sendEmailNotification } = require('../services/emailNotificationService');

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
    const score = Math.floor(Math.random() * (98 - 86) + 86); // Force High Score for demo (86-98)
    
    // Assign a sales officer (randomly from DB)
    const User = require('../models/User');
    const salesOfficers = await User.find({ role: 'sales' });
    let assignedOfficer = null;
    
    if (salesOfficers.length > 0) {
      assignedOfficer = salesOfficers[Math.floor(Math.random() * salesOfficers.length)];
    }

    const newLead = await Lead.create({
      name: company,
      company: company,
      industry: industry,
      email: `contact@${company.toLowerCase().replace(/\s/g, '')}.com`,
      phone: `+1-555-01${Math.floor(Math.random() * 99)}`,
      location: ['New York, USA', 'London, UK', 'Mumbai, India', 'Singapore', 'Berlin, Germany'][Math.floor(Math.random() * 5)],
      matchScore: score,
      status: 'new',
      salesOfficer: assignedOfficer ? assignedOfficer._id : null,
      createdAt: new Date()
    });

    // ---------------------------------------------------------
    // TRIGGER NOTIFICATIONS (WhatsApp + Email)
    // ---------------------------------------------------------
    
    // Prepare officer details for notification
    const officerDetails = {
      name: assignedOfficer?.username || 'Sales Officer',
      phone: assignedOfficer?.phone || process.env.SALES_OFFICER_PHONE || '919876543210',
      email: assignedOfficer?.email || process.env.SALES_OFFICER_EMAIL || 'demo@sanchit.ai'
    };

    // Construct lead object expected by notification services
    const notificationPayload = {
      companyName: newLead.company,
      industry: newLead.industry,
      location: newLead.location || 'Global',
      suggestedProduct: 'Enterprise AI Suite', // Mock product
      priority: 'HIGH', // Force HIGH for notification eligibility
      status: 'NEW',
      reason: `Matched with ${score}% confidence based on recent market expansion signals.`,
      salesOfficer: officerDetails,
      skipTimeCheck: true // Force send even if outside hours for demo
    };

    // Send notifications in background (don't await to keep API fast)
    if (assignedOfficer) {
        console.log(`🚀 Triggering notifications for new lead: ${newLead.company} to ${officerDetails.name}`);
        
        sendNotification(notificationPayload)
        .then(res => console.log('WhatsApp Result:', res.status))
        .catch(err => console.error('WhatsApp Error:', err.message));

        sendEmailNotification(notificationPayload)
        .then(res => console.log('Email Result:', res.status))
        .catch(err => console.error('Email Error:', err.message));
    } else {
        console.log('⚠️ No Sales Officer assigned. Creating lead without notifications.');
    }
    // ---------------------------------------------------------

    res.status(201).json({ success: true, data: newLead });
  } catch (err) {
    console.error('Generate Lead Error:', err);
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

// @desc    Test notification for a specific lead
// @route   POST /api/leads/:id/notify
// @access  Public (for testing)
exports.testLeadNotification = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const notificationPayload = {
      companyName: lead.company,
      industry: lead.industry,
      location: lead.location || 'Unknown',
      suggestedProduct: 'Enterprise AI Suite',
      priority: 'HIGH', // Force HIGH for testing
      status: 'NEW', // Force NEW for testing
      reason: `Manual test notification trigger. Match Score: ${lead.matchScore}`,
      salesOfficer: {
        name: 'Omkar Shukla',
        phone: process.env.SALES_OFFICER_PHONE || '919876543210',
        email: process.env.SALES_OFFICER_EMAIL || 'demo@sanchit.ai'
      },
      skipTimeCheck: true
    };

    console.log(`🔔 Testing notification for lead: ${lead.company}`);

    // Trigger asynchronously
    sendNotification(notificationPayload)
      .then(res => console.log('WhatsApp Test Result:', res.status))
      .catch(err => console.error('WhatsApp Test Error:', err.message));

    sendEmailNotification(notificationPayload)
      .then(res => console.log('Email Test Result:', res.status))
      .catch(err => console.error('Email Test Error:', err.message));

    res.status(200).json({ 
      success: true, 
      message: 'Notifications triggered successfully',
      leadId: lead._id 
    });
  } catch (err) {
    console.error('Test Notification Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
