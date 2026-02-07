const express = require('express');
const router = express.Router();
const { getAccounts, getSingleAccount } = require('../controllers/accountController');
router.route('/').get(getAccounts);
router.route('/:id').get(getSingleAccount);

module.exports = router;
