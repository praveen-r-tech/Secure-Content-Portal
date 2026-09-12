const express = require('express');
const { loginWithGoogle, logout, getMe } = require('../controllers/authController');
const { authenticate, loadUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/google', loginWithGoogle);
router.post('/logout', logout);
router.get('/me', authenticate, loadUser, getMe);

module.exports = router;
