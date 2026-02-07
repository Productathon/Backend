const Log = require('../models/Log');

// @desc    Get all logs with optional filtering
// @route   GET /api/logs
// @access  Public
exports.getLogs = async (req, res) => {
  try {
    const { sourceType, status, search, startDate, endDate } = req.query;
    
    // Build query
    let query = {};
    
    if (sourceType && sourceType !== 'All') {
      query.sourceType = sourceType;
    }
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { contentExcerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      query.scrapedAt = {};
      if (startDate) query.scrapedAt.$gte = new Date(startDate);
      if (endDate) query.scrapedAt.$lte = new Date(endDate);
    }
    
    const logs = await Log.find(query).sort({ scrapedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single log by ID
// @route   GET /api/logs/:id
// @access  Public
exports.getLog = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ success: false, error: 'Log not found' });
    }
    
    res.status(200).json({
      success: true,
      data: log
    });
  } catch (err) {
    console.error('Get log error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get log statistics
// @route   GET /api/logs/stats
// @access  Public
exports.getLogStats = async (req, res) => {
  try {
    const totalLogs = await Log.countDocuments();
    const processedCount = await Log.countDocuments({ status: 'Processed' });
    const pendingCount = await Log.countDocuments({ status: 'Pending' });
    const failedCount = await Log.countDocuments({ status: 'Failed' });
    const usedForLeads = await Log.countDocuments({ usedForLeadGeneration: true });
    
    // Source type distribution
    const sourceTypeDistribution = await Log.aggregate([
      { $group: { _id: '$sourceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        processedCount,
        pendingCount,
        failedCount,
        usedForLeads,
        sourceTypeDistribution
      }
    });
  } catch (err) {
    console.error('Get log stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
