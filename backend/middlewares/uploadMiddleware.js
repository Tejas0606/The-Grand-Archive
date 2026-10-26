const multer = require('multer');

// Memory storage for piping to Cloudinary or base64 fallback
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are accepted in the archive.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 MB limit
  },
  fileFilter
});

module.exports = upload;
