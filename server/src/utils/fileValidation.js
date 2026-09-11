const fs = require('fs');

// Allowed file types with their size limits (bytes) and Cloudinary resource type.
const FILE_RULES = {
  'application/pdf': { type: 'pdf', cloudinaryType: 'image', maxSize: 30 * 1024 * 1024 },
  'video/mp4': { type: 'video', cloudinaryType: 'video', maxSize: 100 * 1024 * 1024 },
  'text/html': { type: 'html', cloudinaryType: 'raw', maxSize: 5 * 1024 * 1024 },
};

// Content type (video/pdf/html) -> Cloudinary resource type.
const TYPE_TO_CLOUDINARY = { video: 'video', pdf: 'image', html: 'raw' };

// Needed when deleting: cloudinary.destroy needs the resource_type.
function toCloudinaryType(type) {
  return TYPE_TO_CLOUDINARY[type];
}

// Reads the first bytes of the temp file so we can sniff the real file type.
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

// Sniffs file signatures instead of trusting the client's Content-Type:
//   PDF  -> starts with %PDF-
//   MP4  -> contains the 'ftyp' box at the start
//   HTML -> starts with '<' (after an optional UTF-8 BOM)
function detectActualType(header) {
  if (header.startsWith('%pdf-')) return 'pdf';
  if (header.includes('ftyp')) return 'video';
  if (/^\s*</.test(header.replace(/^\u00ef\u00bb\u00bf/, ''))) return 'html';
  return null;
}

function validateFile(file) {
  if (!file) {
    return { error: 'No file uploaded.' };
  }

  const rule = FILE_RULES[file.mimetype];
  if (!rule) {
    return { error: 'Only PDF, MP4 and HTML files are allowed.' };
  }

  if (file.size > rule.maxSize) {
    return { error: 'File size exceeds the allowed limit.' };
  }

  const header = readHeader(file.path);
  if (!header || detectActualType(header) !== rule.type) {
    return { error: 'Only PDF, MP4 and HTML files are allowed.' };
  }

  return { type: rule.type, cloudinaryType: rule.cloudinaryType };
}

module.exports = { validateFile, toCloudinaryType };