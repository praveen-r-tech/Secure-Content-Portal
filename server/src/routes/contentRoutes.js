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
  streamContent,
  viewContent,
  getAuditLogs,
} = require('../controllers/contentController');

const router = express.Router();

// Browsing is available to any authenticated user
router.get('/', authenticate, loadUser, listContent);

// Audit logs (admin only) - must come before /:id parameter routes
router.get('/audit-logs', authenticate, loadUser, requireAdmin, getAuditLogs);

// Token-gated protected streaming proxy
router.get('/:id/stream', authenticate, loadUser, streamContent);
router.get('/:id/view', authenticate, loadUser, viewContent);
router.get('/:id', authenticate, loadUser, getContent);

// Admin-only management endpoints
router.post('/', authenticate, loadUser, requireAdmin, uploadMiddleware, createContent);
router.put('/:id', authenticate, loadUser, requireAdmin, updateContent);
router.delete('/:id', authenticate, loadUser, requireAdmin, deleteContent);

module.exports = router;