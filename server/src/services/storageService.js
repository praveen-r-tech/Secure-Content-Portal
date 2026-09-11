const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const FOLDER = 'secure-content-portal';

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

module.exports = { uploadFile, deleteFile };