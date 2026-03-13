import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { getListingById, markAsSold, deleteListing } from '../services/marketplaceService'
import { formatPrice, formatDate, getInitials } from '../utils/helpers'

function MarketplaceItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedImage, setSelectedImage] = useState(0)
  const [contactShown, setContactShown] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['marketplace', id],
    queryFn: () => getListingById(id),
    enabled: !!id,
  })

  const { mutate: handleMarkAsSold, isPending: markingSold } = useMutation({
    mutationFn: () => markAsSold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
      queryClient.invalidateQueries({ queryKey: ['marketplace', id] })
    },
  })

  const { mutate: handleDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
      navigate('/marketplace')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="max-w-4xl mx-auto animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-40 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-video bg-gray-800 rounded-xl" />
                <div>
                  <div className="h-7 bg-gray-700 rounded w-3/4 mb-4" />
                  <div className="h-9 bg-gray-700 rounded w-1/3 mb-6" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="text-center py-16">
              <p className="text-5xl mb-4">😕</p>
              <p className="text-white font-semibold text-lg">Listing not found</p>
              <p className="text-gray-400 mt-2 text-sm">
                This listing may have been deleted or does not exist.
              </p>
              <Link
                to="/marketplace"
                className="mt-5 inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                ← Back to Marketplace
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // sellerId may be a populated object { _id, name, ... } or a plain string ID
  const sellerIdStr = item.sellerId?._id?.toString() || item.sellerId?.toString()
  const currentUserId = user?._id?.toString() || user?.id?.toString()
  const isOwner = !!currentUserId && currentUserId === sellerIdStr
  const images = Array.isArray(item.images) ? item.images : []
  const isAvailable = item.status === 'available'
  // seller info comes from the populated sellerId field
  const seller = typeof item.sellerId === 'object' ? item.sellerId : null

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-5xl mx-auto">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              ← Back to Marketplace
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image gallery */}
              <div>
                <div className="aspect-video bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImage]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      <span className="text-6xl mb-2">📦</span>
                      <span className="text-gray-500 text-sm">No images provided</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-indigo-500 ring-1 ring-indigo-500/50'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Item details */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-2xl font-bold text-white leading-snug">{item.title}</h1>
                  <span
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${
                      isAvailable
                        ? 'bg-green-900/40 text-green-400 border-green-700/40'
                        : 'bg-red-900/40 text-red-400 border-red-700/40'
                    }`}
                  >
                    {isAvailable ? 'Available' : 'Sold'}
                  </span>
                </div>

                <p className="text-3xl font-bold text-indigo-400 mb-4">
                  {formatPrice(item.price)}
                </p>

                {item.category && (
                  <div className="mb-4">
                    <span className="text-xs bg-gray-700 border border-gray-600 text-gray-300 px-2.5 py-1 rounded-full">
                      📂 {item.category}
                    </span>
                  </div>
                )}

                {item.description && (
                  <div className="mb-5">
                    <h2 className="text-gray-300 font-semibold text-sm mb-2">Description</h2>
                    <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
                  </div>
                )}

                <p className="text-gray-500 text-xs mb-5">
                  Listed on {formatDate(item.createdAt)}
                </p>

                {/* Seller info */}
                {seller && (
                  <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 mb-5">
                    <p className="text-gray-500 text-xs font-medium mb-3">Seller</p>
                    <Link
                      to={`/profile/${seller._id || seller.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                        {seller.avatarUrl ? (
                          <img
                            src={seller.avatarUrl}
                            alt={seller.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(seller.name || '')}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm group-hover:text-indigo-400 transition-colors">
                          {seller.name}
                        </p>
                        <p className="text-indigo-400 text-xs">View Profile →</p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Owner actions */}
                {isOwner && (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      {isAvailable && (
                        <button
                          onClick={() => handleMarkAsSold()}
                          disabled={markingSold}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          {markingSold ? (
                            <>
                              <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : (
                            '✓ Mark as Sold'
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting || showDeleteConfirm}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/40 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 hover:text-red-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        🗑 Delete Listing
                      </button>
                    </div>

                    {/* Inline delete confirmation — no browser popup */}
                    {showDeleteConfirm && (
                      <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
                        <p className="text-red-300 font-semibold text-sm mb-1">Delete this listing?</p>
                        <p className="text-gray-400 text-xs mb-4">
                          This will permanently remove "{item.title}" from the marketplace.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              handleDelete()
                            }}
                            disabled={deleting}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            {deleting ? (
                              <>
                                <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Yes, Delete'
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Buyer actions — shown when not the owner and item is available */}
                {!isOwner && isAvailable && (
                  <div>
                    {!contactShown ? (
                      <button
                        onClick={() => setContactShown(true)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
                      >
                        🙋 I'm Interested — Contact Seller
                      </button>
                    ) : (
                      <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                          <p className="text-indigo-300 text-sm font-semibold">You've shown interest!</p>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">
                          Reach out to the seller directly to discuss this listing.
                        </p>
                        <div className="space-y-2">
                          {item.contactPhone && (
                            <div className="flex items-center gap-3 bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5">
                              <span className="text-lg">📞</span>
                              <div className="flex-1">
                                <p className="text-gray-400 text-xs">Phone</p>
                                <p className="text-white font-semibold text-sm">{item.contactPhone}</p>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.contactPhone)
                                  setEmailCopied(true)
                                  setTimeout(() => setEmailCopied(false), 2000)
                                }}
                                className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                              >
                                {emailCopied ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                          )}
                          {seller?.email && (
                            <div className="flex gap-2">
                              <a
                                href={`mailto:${seller.email}?subject=Interested in: ${encodeURIComponent(item.title)}`}
                                className="flex-1 text-center bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 py-2 rounded-lg text-xs font-medium transition-colors"
                              >
                                ✉️ Email Seller
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(seller.email)
                                  setEmailCopied(true)
                                  setTimeout(() => setEmailCopied(false), 2000)
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 py-2 rounded-lg text-xs font-medium transition-colors"
                              >
                                {emailCopied ? '✓ Copied!' : '📋 Copy Email'}
                              </button>
                            </div>
                          )}
                          {!item.contactPhone && !seller?.email && (
                            <p className="text-gray-500 text-xs text-center">
                              No contact info — visit the seller's profile to connect.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Item sold — shown to non-owners when sold */}
                {!isOwner && !isAvailable && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
                    <p className="text-red-400 font-semibold text-sm">This item has been sold</p>
                    <p className="text-gray-500 text-xs mt-1">Check out other available listings.</p>
                    <Link
                      to="/marketplace"
                      className="mt-3 inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                    >
                      ← Browse Marketplace
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MarketplaceItemPage
