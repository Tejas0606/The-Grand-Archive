const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload buffer or base64 to Cloudinary with fallback
 * @param {Buffer|string} fileSource - Buffer or base64 string or file path
 * @param {string} folder - target folder name
 * @returns {Promise<string>} - secure URL or fallback placeholder
 */
const uploadToCloudinary = async (fileBuffer, folder = 'grand_archive') => {
  if (!isCloudinaryConfigured) {
    // If not configured, convert small buffer to base64 data URI for instant local zero-config display
    if (Buffer.isBuffer(fileBuffer)) {
      return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    }
    return typeof fileBuffer === 'string' ? fileBuffer : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.warn('[Cloudinary] Upload failed, falling back to base64/placeholder:', error.message);
          if (Buffer.isBuffer(fileBuffer)) {
            return resolve(`data:image/jpeg;base64,${fileBuffer.toString('base64')}`);
          }
          return resolve('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800');
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary
};
