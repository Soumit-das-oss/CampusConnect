'use strict';

const crypto = require('crypto');
const path = require('path');
const Resource = require('../models/Resource');
const { uploadToS3, getPresignedDownloadUrl, deleteFromS3 } = require('../config/s3');

const ALLOWED_MIME_TYPES = new Set([
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
]);

// POST /api/resources
const uploadResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const { title, description, subject, semester, branch } = req.body;
    if (!title || !subject || !semester || !branch) {
      return res.status(400).json({ success: false, message: 'title, subject, semester, and branch are required.' });
    }

    const campusId = req.user.collegeId?._id || req.user.collegeId;
    if (!campusId) return res.status(400).json({ success: false, message: 'User has no campus association.' });

    const resourceId = crypto.randomUUID();
    const s3Key = `resources/${campusId}/${resourceId}/${req.file.originalname}`;

    const fileUrl = await uploadToS3({
      buffer: req.file.buffer,
      key: s3Key,
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
    });

    const resource = await Resource.create({
      title,
      description,
      subject,
      semester: Number(semester),
      branch,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      s3Key,
      uploadedBy: req.user._id,
      campusId,
    });

    await resource.populate('uploadedBy', 'name avatarUrl');
    res.status(201).json({ success: true, data: { resource } });
  } catch (err) {
    console.error('uploadResource error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload resource.' });
  }
};

// GET /api/resources
const getResources = async (req, res) => {
  try {
    const campusId = req.user.collegeId?._id || req.user.collegeId;
    const { search, subject, semester, branch } = req.query;

    const filter = { campusId };
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (semester) filter.semester = Number(semester);
    if (branch) filter.branch = { $regex: branch, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: resources.length, data: { resources } });
  } catch (err) {
    console.error('getResources error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch resources.' });
  }
};

// GET /api/resources/download/:id  (must be registered before /:id)
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    const campusId = req.user.collegeId?._id || req.user.collegeId;
    if (resource.campusId.toString() !== campusId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const url = await getPresignedDownloadUrl(resource.s3Key, resource.fileName);
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadsCount: 1 } });

    res.json({ success: true, data: { url, fileName: resource.fileName } });
  } catch (err) {
    console.error('downloadResource error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate download link.' });
  }
};

// GET /api/resources/:id
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name avatarUrl');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    const campusId = req.user.collegeId?._id || req.user.collegeId;
    if (resource.campusId.toString() !== campusId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { resource } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch resource.' });
  }
};

// DELETE /api/resources/:id
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    const isUploader = resource.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isUploader && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource.' });
    }

    await deleteFromS3(resource.s3Key);
    await Resource.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Resource deleted successfully.' });
  } catch (err) {
    console.error('deleteResource error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete resource.' });
  }
};

module.exports = { uploadResource, getResources, getResource, downloadResource, deleteResource };
