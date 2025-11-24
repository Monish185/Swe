// src/routes/scan.routes.js
const express = require('express');
const router = express.Router();
const { scanRepo } = require('../controllers/scan.controller');

// POST /scan/repo
router.post('/repo', scanRepo);

module.exports = router;
