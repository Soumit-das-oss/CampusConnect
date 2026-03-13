'use strict';

const path = require('path');
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
function uploadBufferToCloudinary(buffer, originalname) {
  const ext = path.extname(originalname || '').toLowerCase() || '.pdf';
  // Sanitize the base filename (strip extension, remove non-alphanumeric chars)
  const baseName = path.basename(originalname || 'resume', ext)
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 50) || 'resume';
  const publicId = `resume-${Date.now()}-${baseName}${ext}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusconnect_uploads/documents',
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
        public_id: publicId,
        access_mode: 'public',  // Make the file publicly accessible
        type: 'upload',         // Use 'upload' type for public access
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
 * Extract text from PDF buffer, then send to Grok as plain text.
 * This approach works with any OpenAI-compatible model — no multimodal/inlineData needed.
 */
async function extractWithGemini(buffer) {
  // Step 1: Extract plain text from the PDF
  const pdf = require('pdf-parse');
  const pdfData = await pdf(buffer);
  const resumeText = pdfData.text;

  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Could not extract sufficient text from the PDF.');
  }

  // Step 2: Send text to Grok
  const { grokClient } = require('../config/gemini');

  const prompt =
    'You are a resume parser. Analyze the following resume text and return ONLY a raw JSON object ' +
    '(no markdown, no code fences) with this exact structure:\n' +
    '{\n' +
    '  "summary": "brief 1-2 sentence professional summary",\n' +
    '  "skills": ["skill1", "skill2"],\n' +
    '  "education": [{ "institution": "name", "degree": "degree title", "year": "graduation year" }],\n' +
    '  "experience": [{ "company": "company name", "role": "job title", "duration": "time period" }]\n' +
    '}\n' +
    'Extract every technical skill, tool, framework, and language mentioned. Return ONLY valid JSON.\n\n' +
    'RESUME TEXT:\n' + resumeText;

  const completion = await grokClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = completion.choices[0].message.content.trim();
  // Strip markdown fences, then find the first JSON object in the response
  const stripped = text.replace(/```(?:json)?/gi, '').trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Grok returned no JSON object. Raw response: ${text.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
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
    const currentUserId = req.user._id.toString();
    const skillsParam = req.query.skills;

    let skillsFilter = null;
    if (skillsParam && skillsParam.trim() !== '') {
      skillsFilter = skillsParam
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }

    const users = await findUsersByCollege(collegeId, skillsFilter);
    
    // Filter out the current user from results
    const filteredUsers = users.filter(user => user._id.toString() !== currentUserId);

    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      data: { users: filteredUsers },
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
 * Multer memory storage — gives us the buffer so we can pass it to Grok
 * before streaming to Cloudinary.
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
    console.log(`[Resume] Upload request from user: ${req.user?._id}`);

    if (!req.file) {
      console.warn('[Resume] No file in request — multer found nothing');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a resume file.',
      });
    }

    console.log(`[Resume] File received: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
    const { buffer, originalname } = req.file;

    // ── Step 1: Upload to Cloudinary ──────────────────────────────────────────
    let resumeUrl;
    try {
      console.log('[Resume] Starting Cloudinary upload...');
      const cloudResult = await uploadBufferToCloudinary(buffer, originalname);
      resumeUrl = cloudResult.secure_url;
      console.log('[Resume] Cloudinary upload done:', resumeUrl);
    } catch (cloudErr) {
      console.error('[Resume] Cloudinary upload failed:', cloudErr.message);
      return res.status(502).json({
        success: false,
        message: 'Failed to store resume file. Please try again.',
      });
    }

    // ── Step 2: Save resumeUrl to DB ──────────────────────────────────────────
    await updateUserProfile(req.user._id, { resumeUrl });
    console.log('[Resume] resumeUrl saved to DB');

    // ── Step 3: Respond immediately — don't block on AI ───────────────────────
    const user = await findUserById(req.user._id);
    console.log('[Resume] Sending 200 response to client');
    res.status(200).json({
      success: true,
      message: 'Resume uploaded. AI analysis running in background...',
      data: { resumeUrl, resumeData: null, user },
    });

    // ── Step 4: AI extraction in background (fire-and-forget) ─────────────────
    // Response already sent — this runs after client receives it.
    setImmediate(async () => {
      const userId = req.user._id;
      const existingSkills = Array.isArray(req.user.skills) ? req.user.skills : [];
      try {
        const extracted = await extractWithGemini(buffer);
        const { summary, skills: extractedSkills, education, experience } = extracted;

        const merged = [
          ...new Set([
            ...existingSkills,
            ...(extractedSkills || []).map((s) => s.trim()).filter(Boolean),
          ]),
        ];

        const resumeData = {
          summary: summary || null,
          skills: extractedSkills || [],
          education: education || [],
          experience: experience || [],
          extractedAt: new Date(),
        };

        await updateUserProfile(userId, { skills: merged, resumeData });

        // Push result to user's personal socket room
        const { getIO } = require('../config/socket');
        try {
          getIO().to(`user:${userId}`).emit('resume:analyzed', { resumeData, skills: merged });
        } catch (_) { }

        console.log(`[Grok] AI extraction complete for user ${userId}`);
      } catch (err) {
        console.error('[Grok] Background extraction failed:', err.message);
        // Notify client so they know AI failed
        const { getIO } = require('../config/socket');
        try {
          getIO().to(`user:${userId}`).emit('resume:analyzed', { resumeData: null, error: err.message });
        } catch (_) { }
      }
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
