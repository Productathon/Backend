const express = require('express');
const router = express.Router();
const { getAnalyticsStats } = require('../controllers/analyticsController');

router.get('/stats', getAnalyticsStats);

module.exports = router;
