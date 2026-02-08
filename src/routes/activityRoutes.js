const express = require('express');
const { getActivities, createActivity, getActionHistory } = require('../controllers/activityController');

const router = express.Router();

router.get('/history', getActionHistory);
router.get('/:accountId', getActivities);
router.post('/', createActivity);

module.exports = router;
