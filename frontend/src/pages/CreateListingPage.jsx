import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { createListing } from '../services/marketplaceService'

const CATEGORIES = [
  'Textbooks',
  'Electronics',
  'Clothing',
  'Furniture',
  'Stationery',
  'Sports Equipment',
  'Musical Instruments',
  'Cycles & Vehicles',
  'Lab Equipment',
  'Other',
]

function CreateListingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [errors, setErrors] = useState({})

  const { mutate, isPending } = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
      navigate('/marketplace')
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create listing. Please try again.'
      setErrors({ general: msg })
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Revoke old previews
    previews.forEach((url) => URL.revokeObjectURL(url))

    setImages(files)
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx])
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required.'
    else if (formData.title.trim().length < 3)
      newErrors.title = 'Title must be at least 3 characters.'

    if (formData.price === '' || formData.price === null) {
      newErrors.price = 'Price is required.'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Enter a valid non-negative price.'
    }

    if (!formData.category) newErrors.category = 'Please select a category.'

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
    fd.append('price', formData.price)
    fd.append('category', formData.category)
    images.forEach((img) => fd.append('images', img))

    mutate(fd)
  }

  const inputBase =
    'w-full bg-gray-700 border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 placeholder-gray-500 transition-colors'
  const inputClass = (field) =>
    `${inputBase} ${
      errors[field]
        ? 'border-red-500 focus:border-red-400 focus:ring-red-500/30'
        : 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
    }`

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-2xl mx-auto">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              ← Back to Marketplace
            </Link>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Create New Listing</h1>
              <p className="text-gray-400 mt-1 text-sm">
                List an item for sale in the campus marketplace.
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.general && (
                  <div className="flex items-start gap-2.5 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Engineering Mathematics Vol. 2"
                    className={inputClass('title')}
                    maxLength={120}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs mt-1.5">⚠ {errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description
                    <span className="text-gray-500 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the item's condition, usage, age, and other relevant details..."
                    className={`${inputBase} border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 resize-none`}
                    maxLength={1000}
                  />
                  <p className="text-gray-600 text-xs mt-1">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                {/* Price + Category row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Price (₹) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 font-medium text-sm pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        placeholder="500"
                        className={`${inputClass('price')} pl-7`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-400 text-xs mt-1.5">⚠ {errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={inputClass('category')}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-400 text-xs mt-1.5">⚠ {errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Images
                    <span className="text-gray-500 font-normal ml-1">(optional, multiple)</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-gray-700/70 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-3xl mb-1.5">📷</span>
                      <span className="text-gray-300 text-sm font-medium">
                        Click to upload images
                      </span>
                      <span className="text-gray-500 text-xs mt-0.5">
                        PNG, JPG, WEBP — up to 10MB each
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Previews */}
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {previews.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-600 group"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                  >
                    {isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      '+ Create Listing'
                    )}
                  </button>
                  <Link
                    to="/marketplace"
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateListingPage
