const Lead = require('../models/Lead');

// @desc    Get analytics statistics with aggregate queries
// @route   GET /api/analytics/stats
// @access  Public
exports.getAnalyticsStats = async (req, res) => {
  try {
    const { range = '6m' } = req.query;
    
    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    let previousStartDate = new Date();
    
    // Determine days back based on range
    let daysBack = 180; // default 6m
    if (range === '30d') daysBack = 30;
    else if (range === '3m') daysBack = 90;
    else if (range === '6m') daysBack = 180;
    else if (range === '1y') daysBack = 365;
    else if (range === 'all') daysBack = 365 * 10; // 10 years approximation

    startDate.setDate(now.getDate() - daysBack);
    previousStartDate.setDate(startDate.getDate() - daysBack); // Previous period of same duration

    // 1. Total Leads (in selected range)
    const totalLeads = await Lead.countDocuments({ 
      createdAt: { $gte: startDate } 
    });

    // 2. Leads Increase (vs previous period of same duration)
    const previousLeads = await Lead.countDocuments({ 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    });

    let leadsIncrease = '+0%';
    if (previousLeads > 0) {
      const increase = ((totalLeads - previousLeads) / previousLeads) * 100;
      leadsIncrease = `${increase >= 0 ? '+' : ''}${increase.toFixed(1)}%`;
    } else if (totalLeads > 0) {
      leadsIncrease = '+100%';
    }

    // 3. Avg per Month (in selected range)
    // Simplify: Total / (daysBack / 30)
    const monthsInRange = Math.max(1, daysBack / 30);
    const avgPerMonth = Math.round(totalLeads / monthsInRange);

    // 4. Best Month (in selected range)
    const monthlyStats = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const bestMonth = monthlyStats.length > 0 ? fullMonthNames[monthlyStats[0]._id] : '-';

    // 5. Monthly Trends (for Chart)
    const monthlyTrendsAgg = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Fill in missing months? For now, just map existing data.
    // Ideally we generate a list of all months in range and fill 0s, but let's stick to present data for MVP.
    const monthlyTrends = monthlyTrendsAgg.map(item => ({
      label: monthNames[item._id.month],
      value: item.count,
      fullLabel: `${monthNames[item._id.month]} ${item._id.year}`
    }));

    // 6. Industry Performance (in selected range)
    const industryStats = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Fetch previous period industry stats for growth calculation
    const previousIndustryStats = await Lead.aggregate([
      { $match: { createdAt: { $gte: previousStartDate, $lt: startDate } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } }
    ]);

    const industryIcons = {
      'Manufacturing': '🏭',
      'Logistics': '🚚',
      'Technology': '💻',
      'Oil & Gas': '🛢️',
      'Construction': '🏗️',
      'Finance': '💰',
      'Healthcare': '🏥',
      'Retail': '🛒',
      'Other': '👤'
    };

    const formattedIndustries = industryStats.map(ind => {
      const prev = previousIndustryStats.find(p => p._id === ind._id);
      const prevCount = prev ? prev.count : 0;
      let growth = '+0%';
      
      if (prevCount > 0) {
        const diff = ((ind.count - prevCount) / prevCount) * 100;
        growth = `${diff >= 0 ? '+' : ''}${Math.round(diff)}%`;
      } else if (ind.count > 0) {
        growth = '+100%'; // New industry activity
      }

      return {
        name: ind._id || 'Other',
        value: ind.count.toLocaleString(),
        growth, 
        icon: industryIcons[ind._id] || '👤'
      };
    });

    // 7. Status Distribution (in selected range)
    const statusStats = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusLabels = {
      'new': 'New',
      'contacted': 'Contacted',
      'qualified': 'Qualified',
      'converted': 'Closed',
      'closed': 'Other'
    };

    const statusColors = {
      'new': 'bg-indigo-500',
      'contacted': 'bg-purple-500',
      'qualified': 'bg-sky-400',
      'converted': 'bg-green-500',
      'closed': 'bg-slate-300'
    };

    const totalStatusCount = statusStats.reduce((sum, s) => sum + s.count, 0);
    const formattedStatuses = statusStats.map(s => ({
      label: statusLabels[s._id] || s._id,
      percent: totalStatusCount > 0 ? Math.round((s.count / totalStatusCount) * 100) : 0,
      count: s.count.toLocaleString(),
      color: statusColors[s._id] || 'bg-slate-300'
    }));

    // 8. Funnel Data (based on range stats)
    const newCount = statusStats.find(s => s._id === 'new')?.count || 0;
    const contactedCount = statusStats.find(s => s._id === 'contacted')?.count || 0;
    const qualifiedCount = statusStats.find(s => s._id === 'qualified')?.count || 0;
    const convertedCount = statusStats.find(s => s._id === 'converted')?.count || 0;
    
    // Simple funnel simulation: 
    // Top = Total Leads. 
    // Contacted = Contacted + Qualified + Converted
    // Qualified = Qualified + Converted
    // Converted = Converted
    const funnelTotal = totalLeads || 1;
    const stageContacted = contactedCount + qualifiedCount + convertedCount;
    const stageQualified = qualifiedCount + convertedCount;
    const stageConverted = convertedCount;
    
    const funnelData = [
      { label: 'Leads', value: formatNumber(totalLeads), percent: '100%', x: '0%' },
      { label: 'Contacted', value: formatNumber(stageContacted), percent: `${Math.round((stageContacted / funnelTotal) * 100)}%`, x: '20%' },
      { label: 'Qualified', value: formatNumber(stageQualified), percent: `${Math.round((stageQualified / funnelTotal) * 100)}%`, x: '40%' },
      { label: 'Proposal', value: formatNumber(Math.floor(stageConverted * 1.5)), percent: `${Math.round((stageConverted * 1.5 / funnelTotal) * 100)}%`, x: '60%' }, // Mock "Proposal" as 1.5x converted
      { label: 'Converted', value: formatNumber(stageConverted), percent: `${Math.round((stageConverted / funnelTotal) * 100)}%`, x: '80%' }
    ];

    res.status(200).json({
      success: true,
      data: {
        leadsIncrease,
        totalLeads: formatNumber(totalLeads),
        avgPerMonth: formatNumber(avgPerMonth),
        bestMonth,
        monthlyTrends, // New field
        industryPerformance: formattedIndustries,
        statusDistribution: formattedStatuses,
        funnelData
      }
    });

  } catch (err) {
    console.error('Analytics stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper to format numbers (e.g., 15200 -> "15.2K")
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}
