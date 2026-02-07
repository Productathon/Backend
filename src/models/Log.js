const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  // Source Metadata
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  sourceType: {
    type: String,
    enum: ['News', 'Tender', 'Blog', 'Govt Portal', 'Website', 'API'],
    required: true,
  },
  
  // Processing Status
  status: {
    type: String,
    enum: ['Processed', 'Pending', 'Failed'],
    default: 'Pending',
  },
  errorMessage: {
    type: String,
    default: null,
  },
  
  // Crawl Information
  crawlMethod: {
    type: String,
    enum: ['Scraper', 'API', 'RSS', 'Manual'],
    default: 'Scraper',
  },
  
  // Scraped Content Reference
  contentExcerpt: {
    type: String,
    required: false,
    default: null,
  },
  highlightedKeywords: {
    type: [String],
    default: [],
  },
  sectionReference: {
    type: String,
    default: null,
  },
  
  // System Usage Context
  usedForLeadGeneration: {
    type: Boolean,
    default: false,
  },
  inferredIndustry: {
    type: String,
    default: null,
  },
  signalStrength: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  usageDescription: {
    type: String,
    default: null,
  },
  relevanceTag: {
    type: String,
    enum: ['Used for lead generation', 'High relevance', 'Reference only', null],
    default: null,
  },
  
  // Timestamps
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Log', LogSchema);
