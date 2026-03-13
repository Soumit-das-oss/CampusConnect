'use strict';

const { Router } = require('express');
const multer = require('multer');
const {
  uploadResource,
  getResources,
  getResource,
  downloadResource,
  deleteResource,
} = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not allowed.`), false);
    }
  },
});

const router = Router();

router.use(protect);

router.post('/', upload.single('file'), uploadResource);
router.get('/', getResources);
router.get('/download/:id', downloadResource); // must be before /:id
router.get('/:id', getResource);
router.delete('/:id', deleteResource);

module.exports = router;
