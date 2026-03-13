import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { createEvent } from '../services/eventService'

const CATEGORIES = ['hackathon', 'workshop', 'seminar', 'cultural', 'sports', 'other']

function CreateEventPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'other',
  })
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const { mutate, isPending } = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate('/events')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to create event. Please try again.'
      setErrors({ general: msg })
    },
  })

  // Access guard
  if (user?.role !== 'committee') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🚫</p>
              <p className="text-white font-semibold text-lg">Access Denied</p>
              <p className="text-gray-400 mt-2 text-sm">
                Only Committee Heads can create events.
              </p>
              <Link
                to="/events"
                className="mt-5 inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                ← Back to Events
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }))
  }

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const removeBanner = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerFile(null)
    setBannerPreview(null)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Event title is required.'
    else if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters.'
    if (!formData.description.trim()) newErrors.description = 'Description is required.'
    if (!formData.date) newErrors.date = 'Event date is required.'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const fd = new FormData()
    fd.append('title', formData.title.trim())
    fd.append('description', formData.description.trim())
    fd.append('date', formData.date)
    fd.append('category', formData.category)
    if (formData.venue.trim()) fd.append('venue', formData.venue.trim())
    if (bannerFile) fd.append('banner', bannerFile)
    mutate(fd)
  }

  const inputClass = (field) =>
    `w-full bg-gray-700 border ${
      errors[field] ? 'border-red-500' : 'border-gray-600 focus:border-indigo-500'
    } text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
      errors[field] ? 'focus:ring-red-500/50' : 'focus:ring-indigo-500'
    } placeholder-gray-500 transition-colors`

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-2xl mx-auto">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              ← Back to Events
            </Link>

            <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-6">
              <h1 className="text-xl font-bold text-white mb-6">📢 Broadcast New Event</h1>

              {errors.general && (
                <div className="flex items-start gap-2.5 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-5">
                  <span className="mt-0.5 flex-shrink-0">⚠️</span>
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Event Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Annual Hackathon 2025"
                    className={inputClass('title')}
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the event details..."
                    className={inputClass('description') + ' resize-none'}
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Date & Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={inputClass('date') + ' [color-scheme:dark]'}
                    />
                    {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 focus:border-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="e.g. Auditorium / Main Hall / Online"
                    className={inputClass('venue')}
                  />
                </div>

                {/* Banner / Poster Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Event Poster / Banner{' '}
                    <span className="text-gray-500 font-normal">(optional)</span>
                  </label>

                  {bannerPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-600 group">
                      <img
                        src={bannerPreview}
                        alt="banner preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeBanner}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors"
                      >
                        ✕
                      </button>
                      <label className="absolute bottom-2 right-2 cursor-pointer bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-36 bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-gray-700/70 transition-all">
                      <span className="text-3xl mb-1.5">🖼</span>
                      <span className="text-gray-300 text-sm font-medium">
                        Click to upload poster
                      </span>
                      <span className="text-gray-500 text-xs mt-0.5">
                        PNG, JPG, WEBP — up to 10 MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
                  <p className="text-amber-300 text-xs leading-relaxed">
                    📣 This event will be broadcast to all students at your college and they will receive a real-time notification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-md shadow-indigo-600/20"
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    '📢 Broadcast Event'
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateEventPage
