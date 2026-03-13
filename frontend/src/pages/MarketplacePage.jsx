import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MarketplaceItemCard from '../components/MarketplaceItemCard'
import useAuth from '../hooks/useAuth'
import { getListings } from '../services/marketplaceService'

const CATEGORIES = [
  { value: 'all', label: 'All Items' },
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' },
]

function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-700" />
      <div className="p-4">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-700 rounded w-1/3" />
          <div className="h-7 bg-gray-700 rounded-lg w-20" />
        </div>
      </div>
    </div>
  )
}

function MarketplacePage() {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { user } = useAuth()

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['marketplace'],
    queryFn: getListings,
  })

  const filteredListings =
    categoryFilter === 'all'
      ? listings
      : listings.filter((item) =>
          item.category?.toLowerCase() === categoryFilter.toLowerCase()
        )

  const myListingsCount = listings.filter(
    (l) => (l.sellerId?._id || l.sellerId) === (user?._id || user?.id)
  ).length

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Campus Marketplace</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Buy and sell items within your campus community
              </p>
            </div>
            <Link
              to="/marketplace/create"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
            >
              ➕ Create Listing
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Available Listings', value: listings.length, color: 'text-green-400' },
              { label: 'My Listings', value: myListingsCount, color: 'text-indigo-400' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gray-800 border border-gray-700/60 rounded-xl px-4 py-3 text-center"
              >
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === cat.value
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!isLoading && filteredListings.length > 0 && (
            <p className="text-gray-400 text-sm mb-4">
              Showing <span className="text-white font-medium">{filteredListings.length}</span>{' '}
              {filteredListings.length === 1 ? 'item' : 'items'}
            </p>
          )}

          {/* Listings grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
              <p className="text-5xl mb-4">🛒</p>
              <p className="text-white font-semibold text-lg">No listings found</p>
              <p className="text-gray-400 mt-2 text-sm">
                {categoryFilter !== 'all'
                  ? `No items in the "${categoryFilter}" category yet.`
                  : 'Be the first to create a listing on the marketplace!'}
              </p>
              <Link
                to="/marketplace/create"
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                ➕ Create a listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredListings.map((item) => (
                <MarketplaceItemCard key={item._id || item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default MarketplacePage

