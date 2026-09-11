const multer = require('multer');
const fs = require('fs');
const path = require('path');

const ALLOWED_MIMES = ['application/pdf', 'video/mp4', 'text/html'];
const LARGEST_ALLOWED_SIZE = 100 * 1024 * 1024; // video limit; per-type limits are checked later

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Sanitize the original name to avoid path traversal issues.
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: LARGEST_ALLOWED_SIZE },
  // Reject unsupported content types before writing anything to disk.
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      const err = new Error('Only PDF, MP4 and HTML files are allowed.');
      err.statusCode = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

// Single file expected under the field name "file".
module.exports = { uploadMiddleware: upload.single('file'), uploadDir };