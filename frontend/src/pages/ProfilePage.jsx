import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import useUserStore from '../store/userStore'
import { updateProfile, uploadAvatar, uploadResume } from '../services/userService'
import { getInitials } from '../utils/helpers'

function ProfilePage() {
  const { user } = useAuth()
  const updateUser = useUserStore((state) => state.updateUser)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    projects: '',
  })
  const [successMsg, setSuccessMsg] = useState('')
  const [formError, setFormError] = useState('')

  // Sync form with current user data
  useEffect(() => {
    if (!user) return
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      projects: Array.isArray(user.projects)
        ? user.projects
            .map((p) => (typeof p === 'string' ? p : p.title || p.name || ''))
            .filter(Boolean)
            .join('\n')
        : '',
    })
  }, [user])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const { mutate: updateMutate, isPending: updating } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      // service returns the user object directly
      updateUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess('Profile updated successfully!')
      setFormError('')
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to update profile.')
    },
  })

  const { mutate: avatarMutate, isPending: uploadingAvatar } = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      // service returns { avatarUrl, user }
      updateUser({ avatarUrl: data.avatarUrl })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess('Profile picture updated!')
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to upload avatar.')
    },
  })

  const { mutate: resumeMutate, isPending: uploadingResume } = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      // data = { resumeUrl, resumeData, user } — update entire user so skills + resumeData refresh
      updateUser(data.user)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showSuccess(
        data.resumeData
          ? 'Resume uploaded & AI analysis complete! Skills have been updated.'
          : 'Resume uploaded successfully!'
      )
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to upload resume.')
    },
  })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (formError) setFormError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Name is required.')
      return
    }

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const projectsArray = formData.projects
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => ({ title: p }))

    updateMutate({
      name: formData.name.trim(),
      bio: formData.bio.trim(),
      skills: skillsArray,
      projects: projectsArray,
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file.')
      return
    }
    const fd = new FormData()
    fd.append('avatar', file)
    avatarMutate(fd)
  }

  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('resume', file)
    resumeMutate(fd)
  }

  const previewSkills = formData.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-2xl mx-auto">

            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Update your personal information and manage your account settings.
              </p>
            </div>

            {/* Global success / error */}
            {successMsg && (
              <div className="flex items-center gap-2.5 bg-green-900/30 border border-green-700/50 text-green-400 px-4 py-3 rounded-xl text-sm mb-5">
                <span>✓</span>
                {successMsg}
              </div>
            )}
            {formError && (
              <div className="flex items-center gap-2.5 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
                <span>⚠️</span>
                {formError}
              </div>
            )}

            {/* Avatar Section */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 mb-5">
              <h2 className="text-white font-semibold mb-4">Profile Picture</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-indigo-600/20 flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(user?.name || '')}</span>
                  )}
                </div>
                <div>
                  <label
                    className={`cursor-pointer inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingAvatar ? (
                      <>
                        <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>📷 Change Photo</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                  <p className="text-gray-500 text-xs mt-2">JPG, PNG, GIF — max 5MB</p>
                </div>
              </div>
            </div>

            {/* Profile Info Form */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 mb-5">
              <h2 className="text-white font-semibold mb-5">Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 transition-colors"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email Address
                    <span className="text-gray-500 font-normal ml-1">(cannot be changed)</span>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-700/40 border border-gray-700 text-gray-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Bio
                    <span className="text-gray-500 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell others about yourself, your interests, and what you're working on..."
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 resize-none transition-colors"
                    maxLength={500}
                  />
                  <p className="text-gray-600 text-xs mt-1">{formData.bio.length}/500</p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Skills
                    <span className="text-gray-500 font-normal ml-1">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Python, Machine Learning, Node.js, Java..."
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 transition-colors"
                  />
                  {/* Live skill preview */}
                  {previewSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {previewSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Projects
                    <span className="text-gray-500 font-normal ml-1">(one per line)</span>
                  </label>
                  <textarea
                    name="projects"
                    value={formData.projects}
                    onChange={handleChange}
                    rows={4}
                    placeholder={`Campus Event App\nML Disease Detection Model\nHackathon Winner — Smart Traffic System`}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 resize-none transition-colors"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Each line will be added as a separate project entry.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  {updating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    '💾 Save Changes'
                  )}
                </button>
              </form>
            </div>

            {/* Resume Section */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Resume / CV</h2>

              {user?.resumeUrl && (
                <div className="flex items-center gap-3 bg-gray-700/60 border border-gray-600 rounded-xl p-3 mb-4">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm font-medium">Current resume</p>
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                    >
                      View / Download
                    </a>
                  </div>
                </div>
              )}

              <label
                className={`cursor-pointer inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  uploadingResume ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingResume ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>📤 {user?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}</>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                  disabled={uploadingResume}
                />
              </label>
              <p className="text-gray-500 text-xs mt-2">
                Accepted formats: PDF, DOC, DOCX — max 10MB
              </p>
            </div>

            {/* AI Resume Analysis */}
            {user?.resumeData?.extractedAt && (
              <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 mt-5">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">🤖</span>
                  <h2 className="text-white font-semibold">AI Resume Analysis</h2>
                  <span className="ml-auto text-xs text-gray-600">
                    {new Date(user.resumeData.extractedAt).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Summary */}
                {user.resumeData.summary && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Summary
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">{user.resumeData.summary}</p>
                  </div>
                )}

                {/* Extracted Skills */}
                {user.resumeData.skills?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Extracted Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.resumeData.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {user.resumeData.experience?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Experience
                    </p>
                    <div className="space-y-2">
                      {user.resumeData.experience.map((exp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-600 mt-0.5 flex-shrink-0">•</span>
                          <div>
                            <span className="text-gray-300 font-medium">{exp.role}</span>
                            {exp.company && (
                              <span className="text-gray-500"> @ {exp.company}</span>
                            )}
                            {exp.duration && (
                              <span className="text-gray-600 text-xs ml-2">({exp.duration})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {user.resumeData.education?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Education
                    </p>
                    <div className="space-y-2">
                      {user.resumeData.education.map((edu, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-600 mt-0.5 flex-shrink-0">•</span>
                          <div>
                            <span className="text-gray-300 font-medium">{edu.institution}</span>
                            {edu.degree && (
                              <span className="text-gray-500"> — {edu.degree}</span>
                            )}
                            {edu.year && (
                              <span className="text-gray-600 text-xs ml-2">({edu.year})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-700/60">
                  <p className="text-xs text-gray-600">
                    ✨ AI-extracted skills have been automatically merged into your profile skills above.
                    Upload a new resume to refresh the analysis.
                  </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfilePage
