const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, hasRole } = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', [verifyToken, hasRole(['admin'])], userController.getAllUsers);

// Add other user routes (GET /:id, PUT /:id, DELETE /:id) here...

module.exports = router;