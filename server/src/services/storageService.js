const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const FOLDER = 'secure-content-portal';

// Maps our content type to Cloudinary's resource_type.
const TYPE_TO_CLOUDINARY = { video: 'video', pdf: 'image', html: 'raw' };

// Uploads a multer temp file to Cloudinary.
// Returns the public_id (needed to delete later) and the URL (backend-only).
async function uploadFile(filePath, cloudinaryType) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: FOLDER,
    resource_type: cloudinaryType,
  });
  return { publicId: result.public_id, url: result.secure_url };
}

async function deleteFile(publicId, cloudinaryType) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: cloudinaryType });
}

// Generates a signed, tamper-proof Cloudinary URL.
// The signature is computed from the path + API secret, so the URL can't be
// guessed or modified. Cloudinary's CDN handles range requests natively, so
// video seeking works without us proxying the bytes.
function getSignedUrl(publicId, type) {
  const resourceType = TYPE_TO_CLOUDINARY[type];
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    sign_url: true,
    secure: true,
  });
}

module.exports = { uploadFile, deleteFile, getSignedUrl };