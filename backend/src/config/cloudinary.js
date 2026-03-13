'use strict';

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ─── Cloudinary Configuration ─────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Cloudinary Storage for Images (avatars, marketplace) ────────────────────

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campusconnect_uploads/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
  },
});

// ─── Cloudinary Storage for Documents (resumes) ───────────────────────────────

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campusconnect_uploads/documents',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
  },
});

// ─── Multer Instances ─────────────────────────────────────────────────────────

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed.'), false);
    }
  },
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (pdf, doc, docx) are allowed.'), false);
    }
  },
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadDocument,
};
