'use strict';

const multer = require('multer');
const { validationResult } = require('express-validator');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const {
  findUsersByCollege,
  findUserById,
  updateUserProfile,
} = require('../services/user.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true;
  }
  return false;
}

/** Stream a Buffer directly to Cloudinary as a raw document. */
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusconnect_uploads/documents',
        resource_type: 'raw',
        public_id: `resume_${Date.now()}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Send the resume buffer to Gemini and parse the extracted JSON.
 * Returns null (instead of throwing) if AI extraction fails.
 */
async function extractWithGemini(buffer, mimeType) {
  const { model } = require('../config/gemini');

  const prompt =
    'You are a resume parser. Analyze this resume and return ONLY a raw JSON object ' +
    '(no markdown, no code fences) with this exact structure:\n' +
    '{\n' +
    '  "summary": "brief 1-2 sentence professional summary",\n' +
    '  "skills": ["skill1", "skill2"],\n' +
    '  "education": [{ "institution": "name", "degree": "degree title", "year": "graduation year" }],\n' +
    '  "experience": [{ "company": "company name", "role": "job title", "duration": "time period" }]\n' +
    '}\n' +
    'Extract every technical skill, tool, framework, and language mentioned. Return ONLY valid JSON.';

  const result = await model.generateContent([
    {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    },
    prompt,
  ]);

  const text = result.response.text().trim();
  // Strip markdown code fences if the model wraps in them
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/users
 * Return all users belonging to the same college as the requesting user.
 * Supports optional ?skills=react,node query param for filtering.
 */
async function getAllUsers(req, res, next) {
  try {
    const collegeId = req.user.collegeId._id || req.user.collegeId;
    const skillsParam = req.query.skills;

    let skillsFilter = null;
    if (skillsParam && skillsParam.trim() !== '') {
      skillsFilter = skillsParam
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }

    const users = await findUsersByCollege(collegeId, skillsFilter);

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id
 * Return a single user by their MongoDB ObjectId.
 */
async function getUserById(req, res, next) {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/users/profile
 * Update authenticated user's profile fields.
 */
async function updateProfile(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const allowedFields = ['name', 'bio', 'skills', 'projects'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const user = await updateUserProfile(req.user._id, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Upload Resume ────────────────────────────────────────────────────────────

/**
 * Multer memory storage — gives us the buffer so we can pass it to Gemini
 * before streamingt to Cloudinary.
 */
const uploadResumeMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, or DOCX files are allowed.'), false);
    }
  },
}).single('resume');

async function uploadResumeHandler(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a resume file.',
      });
    }

    const { buffer, mimetype } = req.file;

    // Upload to Cloudinary and run Gemini extraction in parallel
    const [cloudResult, geminiResult] = await Promise.allSettled([
      uploadBufferToCloudinary(buffer),
      extractWithGemini(buffer, mimetype),
    ]);

    if (cloudResult.status === 'rejected') {
      throw cloudResult.reason;
    }

    const resumeUrl = cloudResult.value.secure_url;
    const updates = { resumeUrl };

    let resumeData = null;

    if (geminiResult.status === 'fulfilled') {
      const { summary, skills: extractedSkills, education, experience } = geminiResult.value;

      // Merge AI-extracted skills with the user's existing skills (deduped)
      const existing = Array.isArray(req.user.skills) ? req.user.skills : [];
      const merged = [
        ...new Set([
          ...existing,
          ...(extractedSkills || []).map((s) => s.trim()).filter(Boolean),
        ]),
      ];

      resumeData = {
        summary: summary || null,
        skills: extractedSkills || [],
        education: education || [],
        experience: experience || [],
        extractedAt: new Date(),
      };

      updates.skills = merged;
      updates.resumeData = resumeData;
    }

    const user = await updateUserProfile(req.user._id, updates);

    res.status(200).json({
      success: true,
      message:
        geminiResult.status === 'fulfilled'
          ? 'Resume uploaded and AI analysis complete.'
          : 'Resume uploaded. (AI analysis unavailable — check GEMINI_API_KEY)',
      data: { resumeUrl, resumeData, user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/resume
 * Upload or replace the authenticated user's resume.
 * Uses memory storage so the buffer is available for Gemini AI extraction.
 */
const uploadResume = [uploadResumeMiddleware, uploadResumeHandler];

// ─── Upload Avatar ────────────────────────────────────────────────────────────

const uploadAvatarMiddleware = uploadImage.single('avatar');

async function uploadAvatarHandler(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach an image file.',
      });
    }

    const avatarUrl = req.file.path;

    const user = await updateUserProfile(req.user._id, { avatarUrl });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: { avatarUrl, user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/avatar
 * Upload or replace the authenticated user's avatar image via Cloudinary.
 */
const uploadAvatar = [uploadAvatarMiddleware, uploadAvatarHandler];

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  uploadResume,
  uploadAvatar,
};
