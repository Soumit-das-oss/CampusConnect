'use strict';

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    branch: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String },
    s3Key: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    downloadsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ campusId: 1, createdAt: -1 });
resourceSchema.index({ campusId: 1, subject: 1 });
resourceSchema.index({ campusId: 1, semester: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
