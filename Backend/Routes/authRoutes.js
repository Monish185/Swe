const express = require('express')
const router = express.Router();
const authController = require('../controllers/authController')

router.get('/github',authController.login)

router.get('/github/callback',authController.callbacklogin)

module.exports = router;