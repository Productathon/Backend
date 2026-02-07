const express = require('express');
const router = express.Router();
const { getLogs, getLog, getLogStats } = require('../controllers/logController');

router.get('/stats', getLogStats);
router.get('/:id', getLog);
router.get('/', getLogs);

module.exports = router;
