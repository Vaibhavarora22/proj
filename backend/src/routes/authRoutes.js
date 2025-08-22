const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validationMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (or Admin only, depending on your rules)
router.post('/register', validateRegistration, authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', authController.login);

module.exports = router;