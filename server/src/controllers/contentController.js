const fs = require('fs');
const { Readable } = require('stream');
const Content = require('../models/Content');
const AuditLog = require('../models/AuditLog');
const storageService = require('../services/storageService');
const { validateFile, toCloudinaryType } = require('../utils/fileValidation');

// GET /api/content - list content metadata
async function listContent(req, res, next) {
  try {
    const items = await Content.find().sort({ createdAt: -1 }).limit(100);
    const isAdmin = req.user && req.user.role === 'admin';
    // Admin users see usage metrics (viewCount, lastViewedAt); normal viewers do not.
    res.status(200).json({
      content: items.map((item) => item.toJson(isAdmin)),
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/content/:id - get single content metadata
async function getContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }
    const isAdmin = req.user && req.user.role === 'admin';
    res.status(200).json({ content: item.toJson(isAdmin) });
  } catch (error) {
    next(error);
  }
}

// POST /api/content (admin only) - uploads file to Cloudinary & saves metadata
async function createContent(req, res, next) {
  let uploadedPublicId = null;
  let uploadedType = null;

  try {
    const validation = validateFile(req.file);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const title = (req.body.title || '').trim();
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const result = await storageService.uploadFile(req.file.path, validation.cloudinaryType);
    uploadedPublicId = result.publicId;
    uploadedType = validation.cloudinaryType;

    const item = await Content.create({
      title,
      description: (req.body.description || '').trim(),
      category: (req.body.category || '').trim() || 'General',
      type: validation.type,
      storagePublicId: result.publicId,
      storageUrl: result.url,
      createdBy: req.user._id,
    });

    // Record audit log
    await AuditLog.create({
      action: 'upload',
      performedBy: {
        email: req.user.email,
        userId: req.user._id,
      },
      targetTitle: item.title,
      targetType: item.type,
      details: `Uploaded ${item.type.toUpperCase()} content: "${item.title}"`,
    });

    res.status(201).json({ content: item.toJson(true) });
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await storageService.deleteFile(uploadedPublicId, uploadedType);
      } catch (cleanupError) {
        console.error('Cloudinary cleanup failed:', cleanupError.message);
      }
    }
    next(error);
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
}

// PUT /api/content/:id (admin only) - updates title, description, category
async function updateContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    const title = (req.body.title || '').trim();
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    item.title = title;
    item.description = (req.body.description || '').trim();
    item.category = (req.body.category || '').trim() || 'General';
    await item.save();

    // Record audit log
    await AuditLog.create({
      action: 'edit',
      performedBy: {
        email: req.user.email,
        userId: req.user._id,
      },
      targetTitle: item.title,
      targetType: item.type,
      details: `Edited metadata for "${item.title}"`,
    });

    res.status(200).json({ content: item.toJson(true) });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/content/:id (admin only) - deletes from Cloudinary and MongoDB
async function deleteContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    await storageService.deleteFile(item.storagePublicId, toCloudinaryType(item.type));

    // Record audit log before deleting
    await AuditLog.create({
      action: 'delete',
      performedBy: {
        email: req.user.email,
        userId: req.user._id,
      },
      targetTitle: item.title,
      targetType: item.type,
      details: `Deleted ${item.type.toUpperCase()}: "${item.title}"`,
    });

    await item.deleteOne();
    res.status(200).json({ message: 'Content deleted.' });
  } catch (error) {
    next(error);
  }
}

// GET /api/content/:id/stream - Token-gated protected streaming proxy
// Files are never exposed via a permanent public URL.
// Supports HTTP 206 range requests for smooth video playback.
async function streamContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    // Increment view count & timestamp
    await Content.findByIdAndUpdate(item._id, {
      $inc: { viewCount: 1 },
      lastViewedAt: new Date(),
    });

    // Obtain signed URL for Cloudinary backend fetch
    const sourceUrl = storageService.getSignedUrl(item.storagePublicId, item.type);

    if (item.type === 'video') {
      const fetchHeaders = {};
      if (req.headers.range) {
        fetchHeaders.Range = req.headers.range;
      }

      const upstream = await fetch(sourceUrl, { headers: fetchHeaders });

      if (upstream.status === 206) {
        res.status(206);
        res.set({
          'Content-Range': upstream.headers.get('content-range'),
          'Accept-Ranges': 'bytes',
          'Content-Length': upstream.headers.get('content-length'),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        });
      } else {
        res.status(200);
        res.set({
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        });
        if (upstream.headers.get('content-length')) {
          res.set('Content-Length', upstream.headers.get('content-length'));
        }
      }

      if (!upstream.body) {
        return res.end();
      }
      return Readable.fromWeb(upstream.body).pipe(res);
    }

    if (item.type === 'pdf') {
      const upstream = await fetch(sourceUrl);
      if (!upstream.ok) {
        return res.status(upstream.status).json({ message: 'Failed to retrieve PDF from storage.' });
      }
      res.status(200);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      });
      if (upstream.headers.get('content-length')) {
        res.set('Content-Length', upstream.headers.get('content-length'));
      }
      if (!upstream.body) {
        return res.end();
      }
      return Readable.fromWeb(upstream.body).pipe(res);
    }

    if (item.type === 'html') {
      const upstream = await fetch(sourceUrl);
      if (!upstream.ok) {
        return res.status(upstream.status).json({ message: 'Failed to retrieve HTML from storage.' });
      }
      const htmlText = await upstream.text();
      res.status(200);
      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline'; script-src 'unsafe-inline' 'self'; style-src 'unsafe-inline' 'self'; object-src 'none';",
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      });
      return res.send(htmlText);
    }

    if (item.type === 'markdown') {
      const upstream = await fetch(sourceUrl);
      if (!upstream.ok) {
        return res.status(upstream.status).json({ message: 'Failed to retrieve Markdown from storage.' });
      }
      const mdText = await upstream.text();
      res.status(200);
      res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      });
      return res.send(mdText);
    }

    res.status(400).json({ message: 'Unsupported content type.' });
  } catch (error) {
    next(error);
  }
}

// GET /api/content/:id/view - Returns streaming endpoint relative path
async function viewContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    // Return the protected proxy stream route
    const streamUrl = `/api/content/${item._id}/stream`;
    res.status(200).json({ url: streamUrl, type: item.type });
  } catch (error) {
    next(error);
  }
}

// GET /api/content/audit-logs (admin only)
async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ logs: logs.map((l) => l.toJson()) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listContent,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  streamContent,
  viewContent,
  getAuditLogs,
};