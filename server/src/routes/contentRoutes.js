const express = require('express');
const { authenticate, loadUser } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');
const { listContent, getContent, createContent } = require('../controllers/contentController');

const router = express.Router();

// Browsing is available to any authenticated user.
router.get('/', authenticate, loadUser, listContent);
router.get('/:id', authenticate, loadUser, getContent);

// Creating content is admin-only.
router.post('/', authenticate, loadUser, requireAdmin, uploadMiddleware, createContent);

module.exports = router;