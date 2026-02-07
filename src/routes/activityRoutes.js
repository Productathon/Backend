const express = require('express');
const { getActivities, createActivity } = require('../controllers/activityController');

const router = express.Router();

router.get('/:accountId', getActivities);
router.post('/', createActivity);

module.exports = router;
