const Lead = require('../models/Lead');
const Account = require('../models/Account');

// @desc    Get dashboard statistics with aggregate queries
// @route   GET /api/dashboard/stats
// @access  Public
exports.getDashboardStats = async (req, res) => {
  try {
    // Date filtering logic
    const days = parseInt(req.query.days) || 30; // Default to 30 days if not specified
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Filter object for queries
    const dateFilter = { createdAt: { $gte: startDate } };

    // Basic counts with date filter
    const totalLeads = await Lead.countDocuments(dateFilter);
    const activeLeads = await Lead.countDocuments({ ...dateFilter, status: 'new' });
    const convertedLeads = await Lead.countDocuments({ ...dateFilter, status: { $in: ['converted', 'closed'] } });
    
    // Average score aggregation
    const avgScoreResult = await Lead.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);
    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore * 10) / 10 : 0;
    
    // Conversion rate
    const totalProcessed = activeLeads + convertedLeads;
    const conversionRate = totalProcessed > 0 
      ? Math.round((convertedLeads / totalProcessed) * 100 * 10) / 10 
      : 0;
    
    // Lead trends - over selected days
    const leadTrends = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          date: { $first: '$createdAt' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Map day numbers to names and fill in missing days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendsMap = {};
    leadTrends.forEach(t => {
      trendsMap[t._id] = t.count;
    });
    
    const formattedTrends = [];
    let maxCount = 0;
    let peakDay = '';

    for (let i = 1; i <= 7; i++) {
      const dayIndex = i % 7; // MongoDB uses 1=Sun, 2=Mon, etc.
      const count = trendsMap[i] || 0;
      const dayName = dayNames[dayIndex];
      
      formattedTrends.push({
        day: dayName,
        count: count,
      });

      if (count >= maxCount) {
        maxCount = count;
        peakDay = dayName;
      }
    }

    // Generate insight
    let trendInsight = "Lead volume is stable.";
    if (maxCount > 0) {
      trendInsight = `Lead volume peaked on ${peakDay} with ${maxCount} new leads.`;
    } else {
      trendInsight = "No new leads recorded in this period.";
    }

    // Industry distribution
    const industryDistribution = await Lead.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    console.log('Industry Distribution:', industryDistribution); // Debug log

    const totalForIndustry = industryDistribution.reduce((sum, ind) => sum + ind.count, 0);
    const formattedIndustries = industryDistribution.map(ind => ({
      name: ind._id || 'Other',
      count: ind.count,
      percentage: totalForIndustry > 0 ? Math.round((ind.count / totalForIndustry) * 100) : 0
    }));

    // Status distribution
    const statusDistribution = await Lead.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Status Distribution:', statusDistribution); // Debug log

    const totalForStatus = statusDistribution.reduce((sum, s) => sum + s.count, 0);
    const formattedStatuses = statusDistribution.map(s => ({
      status: s._id,
      count: s.count,
      percentage: totalForStatus > 0 ? Math.round((s.count / totalForStatus) * 100) : 0
    }));

    // Priorities - count needs attention
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newLeadsToday = await Lead.countDocuments({ 
      status: 'new', 
      createdAt: { $gte: today } 
    });
    
    console.log('New Leads Today:', newLeadsToday, 'Date:', today); // Debug log

    // Consider leads older than 3 days as "overdue"
    // Fix: Ensure we use the date filter limit as well if strictly needed, but overdue implies "old", so maybe not?
    // Actually, "overdue" usually means "status new AND old enough".
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const overdueCount = await Lead.countDocuments({
      status: 'new',
      createdAt: { $lt: threeDaysAgo }
    });
    
    console.log('Overdue Count:', overdueCount); // Debug log

    const responseData = {
      totalLeads: totalLeads || 0,
      activeLeads: activeLeads || 0,
      conversionRate: conversionRate || 0,
      avgScore: avgScore || 0,
      leadTrends: formattedTrends,
      trendInsight,
      industryDistribution: formattedIndustries,
      statusDistribution: formattedStatuses,
      priorities: {
        overdueCount: overdueCount || 0,
        newLeadsToday: newLeadsToday || 0
      }
    };

    console.log('Dashboard stats generated:', {
      totalLeads,
      activeLeads,
      newLeadsToday
    });

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
