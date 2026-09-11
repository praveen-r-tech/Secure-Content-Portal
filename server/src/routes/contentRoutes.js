const express = require('express');
const { authenticate, loadUser } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');
const {
  listContent,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  viewContent,
} = require('../controllers/contentController');

const router = express.Router();

// Browsing is available to any authenticated user.
router.get('/', authenticate, loadUser, listContent);

// /:id/view must be declared before /:id so Express doesn't treat "view" as an id.
router.get('/:id/view', authenticate, loadUser, viewContent);
router.get('/:id', authenticate, loadUser, getContent);

// Creating, editing and deleting are admin-only.
router.post('/', authenticate, loadUser, requireAdmin, uploadMiddleware, createContent);
router.put('/:id', authenticate, loadUser, requireAdmin, updateContent);
router.delete('/:id', authenticate, loadUser, requireAdmin, deleteContent);

module.exports = router;