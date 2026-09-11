const fs = require('fs');
const Content = require('../models/Content');
const storageService = require('../services/storageService');
const { validateFile, toCloudinaryType } = require('../utils/fileValidation');

// GET /api/content - list the newest content first (metadata only).
async function listContent(req, res, next) {
  try {
    const items = await Content.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ content: items.map((item) => item.toJson()) });
  } catch (error) {
    next(error);
  }
}

// GET /api/content/:id
async function getContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }
    res.status(200).json({ content: item.toJson() });
  } catch (error) {
    next(error);
  }
}

// POST /api/content (admin only) - validates the file, stores it in Cloudinary
// and saves only metadata in MongoDB. The storage URL is never returned.
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

    // Optional client hint; the real type always comes from the file.
    const providedType = (req.body.type || '').trim().toLowerCase();
    if (providedType && providedType !== validation.type) {
      return res.status(400).json({ message: 'The selected type does not match the file content.' });
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

    res.status(201).json({ content: item.toJson() });
  } catch (error) {
    // Roll back the Cloudinary upload if the DB insert failed.
    if (uploadedPublicId) {
      try {
        await storageService.deleteFile(uploadedPublicId, uploadedType);
      } catch (cleanupError) {
        console.error('Cloudinary cleanup failed:', cleanupError.message);
      }
    }
    next(error);
  } finally {
    // Always remove the multer temp file from disk.
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
}

// PUT /api/content/:id (admin only) - edits metadata only (title, description, category).
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

    res.status(200).json({ content: item.toJson() });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/content/:id (admin only) - removes the file from Cloudinary
// first, then removes the metadata from MongoDB.
async function deleteContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    // Delete the stored file from Cloudinary before touching MongoDB.
    // If this fails, we keep the metadata so the record stays manageable.
    await storageService.deleteFile(item.storagePublicId, toCloudinaryType(item.type));

    await item.deleteOne();
    res.status(200).json({ message: 'Content deleted.' });
  } catch (error) {
    next(error);
  }
}

// GET /api/content/:id/view - returns a signed, tamper-proof URL so the
// browser can stream the file directly from Cloudinary's CDN without us
// ever exposing a permanent public storage URL.
async function viewContent(req, res, next) {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    const url = storageService.getSignedUrl(item.storagePublicId, item.type);
    res.status(200).json({ url, type: item.type });
  } catch (error) {
    next(error);
  }
}

module.exports = { listContent, getContent, createContent, updateContent, deleteContent, viewContent };