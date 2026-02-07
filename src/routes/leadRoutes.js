const express = require('express');
const router = express.Router();
const { getLeads, convertLead } = require('../controllers/leadController');

router.route('/').get(getLeads);
router.route('/convert').post(convertLead);

module.exports = router;
