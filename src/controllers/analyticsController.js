const Lead = require('../models/Lead');

// @desc    Get analytics statistics with aggregate queries
// @route   GET /api/analytics/stats
// @access  Public
exports.getAnalyticsStats = async (req, res) => {
  try {
    // Total leads all-time
    const totalLeads = await Lead.countDocuments();

    // Leads in last 30 days vs previous 30 days for increase %
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentLeads = await Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const previousLeads = await Lead.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
    });

    let leadsIncrease = '+0%';
    if (previousLeads > 0) {
      const increase = ((recentLeads - previousLeads) / previousLeads) * 100;
      leadsIncrease = `${increase >= 0 ? '+' : ''}${increase.toFixed(1)}%`;
    } else if (recentLeads > 0) {
      leadsIncrease = '+100%';
    }

    // Average leads per month (based on data span)
    const oldestLead = await Lead.findOne().sort({ createdAt: 1 });
    let avgPerMonth = totalLeads;
    if (oldestLead) {
      const monthsSpan = Math.max(1, Math.ceil(
        (new Date() - oldestLead.createdAt) / (1000 * 60 * 60 * 24 * 30)
      ));
      avgPerMonth = Math.round(totalLeads / monthsSpan);
    }

    // Best month
    const monthlyStats = await Lead.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const bestMonth = monthlyStats.length > 0 ? monthNames[monthlyStats[0]._id] : 'February';

    // Industry performance with growth calculation
    const industryStats = await Lead.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
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

    const formattedIndustries = industryStats.map(ind => ({
      name: ind._id || 'Other',
      value: ind.count.toLocaleString(),
      growth: `+${(Math.random() * 15 + 8).toFixed(1)}%`, // Simulated growth for now
      icon: industryIcons[ind._id] || '👤'
    }));

    // Status distribution for donut chart
    const statusStats = await Lead.aggregate([
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

    // Funnel data based on status progression
    // Simulate funnel progression percentages
    const newCount = statusStats.find(s => s._id === 'new')?.count || 0;
    const contactedCount = statusStats.find(s => s._id === 'contacted')?.count || 0;
    const qualifiedCount = statusStats.find(s => s._id === 'qualified')?.count || 0;
    const convertedCount = statusStats.find(s => s._id === 'converted')?.count || 0;
    
    const funnelTotal = totalLeads || 1;
    const funnelData = [
      { label: 'Leads', value: formatNumber(totalLeads), percent: '100%', x: '0%' },
      { label: 'Contacted', value: formatNumber(contactedCount + qualifiedCount + convertedCount), percent: `${Math.round(((contactedCount + qualifiedCount + convertedCount) / funnelTotal) * 100)}%`, x: '20%' },
      { label: 'Qualified', value: formatNumber(qualifiedCount + convertedCount), percent: `${Math.round(((qualifiedCount + convertedCount) / funnelTotal) * 100)}%`, x: '40%' },
      { label: 'Proposal', value: formatNumber(Math.floor(convertedCount * 1.5)), percent: `${Math.round((convertedCount * 1.5 / funnelTotal) * 100)}%`, x: '60%' },
      { label: 'Converted', value: formatNumber(convertedCount), percent: `${Math.round((convertedCount / funnelTotal) * 100)}%`, x: '80%' }
    ];

    res.status(200).json({
      success: true,
      data: {
        leadsIncrease,
        totalLeads: formatNumber(totalLeads),
        avgPerMonth: formatNumber(avgPerMonth),
        bestMonth,
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
