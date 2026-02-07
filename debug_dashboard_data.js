const mongoose = require('mongoose');
const Lead = require('./src/models/Lead');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/knapsack-sales-portal');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const debugData = async () => {
  await connectDB();

  try {
    const count = await Lead.countDocuments();
    console.log(`Total Leads: ${count}`);

    const sampleLeads = await Lead.find().limit(5);
    console.log('Sample Leads (Industry & CreatedAt):');
    sampleLeads.forEach(l => {
      console.log(`- ID: ${l._id}, Industry: "${l.industry}", Status: "${l.status}", CreatedAt: ${l.createdAt}`);
    });

    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const dateFilterCount = await Lead.countDocuments({ createdAt: { $gte: startDate } });
    console.log(`Leads in last 30 days: ${dateFilterCount}`);

    const industryAgg = await Lead.aggregate([
       { $match: { createdAt: { $gte: startDate } } },
       { $group: { _id: '$industry', count: { $sum: 1 } } }
    ]);
    console.log('Industry Aggregation (Last 30 days):', industryAgg);

    const today = new Date();
    today.setHours(0,0,0,0);
    const newLeadsToday = await Lead.countDocuments({ status: 'new', createdAt: { $gte: today } });
    console.log(`New Leads Today (since ${today.toISOString()}): ${newLeadsToday}`);
    
    // Check if case sensitivity is an issue
    const newLeadsCase = await Lead.find({ status: { $regex: /^new$/i } }).countDocuments();
    console.log(`Leads with status 'new' (case insensitive): ${newLeadsCase}`);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

debugData();
