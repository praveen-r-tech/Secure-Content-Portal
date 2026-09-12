const fs = require('fs');
const path = require('path');

// Maximum file size limits (bytes)
const SIZE_LIMITS = {
  pdf: 30 * 1024 * 1024,      // 30MB
  video: 100 * 1024 * 1024,   // 100MB
  html: 5 * 1024 * 1024,      // 5MB
  markdown: 5 * 1024 * 1024,  // 5MB
};

// Content type -> Cloudinary resource type.
const TYPE_TO_CLOUDINARY = { video: 'video', pdf: 'image', html: 'raw', markdown: 'raw' };

function toCloudinaryType(type) {
  return TYPE_TO_CLOUDINARY[type] || 'raw';
}

// Reads the first 1024 bytes of the temp file to sniff the real file signature.
function readHeader(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    try {
      const buffer = Buffer.alloc(1024);
      const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
      return buffer.subarray(0, bytesRead).toString('ascii').toLowerCase();
    } finally {
      fs.closeSync(fd);
    }
  } catch (error) {
    return '';
  }
}

// Sniffs file signatures:
//   PDF  -> starts with %pdf-
//   MP4  -> contains 'ftyp' box in the header
//   HTML -> starts with '<' or '<!doctype' or '<!--'
//   Markdown -> .md or .markdown extension containing plain text
function detectActualType(header, ext) {
  if (['.md', '.markdown'].includes(ext)) return 'markdown';
  if (!header) return null;
  if (header.startsWith('%pdf-')) return 'pdf';
  if (header.includes('ftyp')) return 'video';
  const trimmed = header.replace(/^\u00ef\u00bb\u00bf/, '').trim();
  if (trimmed.startsWith('<') || trimmed.startsWith('<!doctype') || trimmed.startsWith('<!--')) {
    return 'html';
  }
  return null;
}

function validateFile(file) {
  if (!file) {
    return { error: 'No file uploaded.' };
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const header = readHeader(file.path);
  const detectedType = detectActualType(header, ext);

  if (!detectedType) {
    return { error: 'Unsupported file content. Only PDF, MP4, HTML, and Markdown files are allowed.' };
  }

  // Cross-check with extension
  if (detectedType === 'pdf' && ext !== '.pdf') {
    return { error: 'File content does not match PDF extension.' };
  }
  if (detectedType === 'video' && ext !== '.mp4') {
    return { error: 'File content does not match MP4 extension.' };
  }
  if (detectedType === 'html' && !['.html', '.htm'].includes(ext)) {
    return { error: 'File content does not match HTML extension.' };
  }
  if (detectedType === 'markdown' && !['.md', '.markdown'].includes(ext)) {
    return { error: 'File content does not match Markdown extension.' };
  }

  const limit = SIZE_LIMITS[detectedType];
  if (file.size > limit) {
    return { error: `File size exceeds the allowed limit (${Math.round(limit / (1024 * 1024))}MB).` };
  }

  return {
    type: detectedType,
    cloudinaryType: toCloudinaryType(detectedType),
  };
}

module.exports = { validateFile, toCloudinaryType, SIZE_LIMITS };