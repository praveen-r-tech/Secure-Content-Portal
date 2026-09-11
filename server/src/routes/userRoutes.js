const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { getCurrentUser } = require('../controllers/userController');

const router = express.Router();

// Returns the Mongo user for the authenticated Auth0 account,
// creating it with role viewer on first login.
router.get('/me', authenticate, getCurrentUser);

module.exports = router;