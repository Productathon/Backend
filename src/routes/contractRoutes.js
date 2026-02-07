const express = require('express');
const { createContract, getContractByToken, signContract } = require('../controllers/contractController');

const router = express.Router();

router.post('/', createContract);
router.get('/:token', getContractByToken);
router.post('/:token/sign', signContract);

module.exports = router;
