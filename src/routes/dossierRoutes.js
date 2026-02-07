const express = require('express');
const router = express.Router();
const { getDossiers } = require('../controllers/dossierController');

router.route('/').get(getDossiers);

module.exports = router;
