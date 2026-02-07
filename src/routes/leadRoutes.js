const express = require('express');
const router = express.Router();
const { getLeads, getLead, convertLead, generateLead, updateLeadStatus, addLeadFeedback } = require('../controllers/leadController');

router.route('/').get(getLeads);
router.route('/:id').get(getLead);
router.route('/:id/feedback').post(addLeadFeedback);
router.route('/generate').post(generateLead);
router.route('/:id/status').put(updateLeadStatus);
router.route('/convert').post(convertLead);

module.exports = router;
