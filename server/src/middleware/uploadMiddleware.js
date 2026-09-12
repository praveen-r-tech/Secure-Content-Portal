const multer = require('multer');
const fs = require('fs');
const path = require('path');

const ALLOWED_MIMES = [
  'application/pdf',
  'video/mp4',
  'text/html',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/octet-stream',
];
const ALLOWED_EXTS = ['.pdf', '.mp4', '.html', '.htm', '.md', '.markdown'];
const LARGEST_ALLOWED_SIZE = 100 * 1024 * 1024; // 100MB max limit

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: LARGEST_ALLOWED_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mimeValid = ALLOWED_MIMES.includes(file.mimetype);
    const extValid = ALLOWED_EXTS.includes(ext);

    if (!mimeValid && !extValid) {
      const err = new Error('Only PDF, MP4 and HTML files are allowed.');
      err.statusCode = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

module.exports = { uploadMiddleware: upload.single('file'), uploadDir };