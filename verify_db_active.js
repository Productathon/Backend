const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Account = require('./models/Account'); 
const connectDB = require('./config/db');

dotenv.config();

const verifyData = async () => {
  try {
    await connectDB();
    
    // Create a NEW unique account
    const newAccount = await Account.create({
      company: 'Data Verification Corp',
      industry: 'Technology',
      value: '$99M',
      owner: 'Antigravity AI',
      status: 'Active',
      lastInteraction: new Date()
    });

    console.log(`SUCCESS: Created account '${newAccount.company}' with ID: ${newAccount._id}`);
    console.log("Please refresh the accounts page to see this new entry at the top.");
    
    process.exit();
  } catch (err) {
    console.error("Verification Failed:", err);
    process.exit(1);
  }
};

verifyData();
