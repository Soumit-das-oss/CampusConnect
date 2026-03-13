import { Link } from 'react-router-dom'
import { formatDate, formatPrice } from '../utils/helpers'

function MarketplaceItemCard({ item }) {
  const { id, title, price, images = [], status, createdAt, seller } = item

  const thumbnailUrl = images && images.length > 0 ? images[0] : null
  const isAvailable = status === 'AVAILABLE'

  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden hover:border-indigo-500/60 transition-all hover:shadow-lg hover:shadow-indigo-900/20 group flex flex-col">
      {/* Image */}
      <Link to={`/marketplace/${id}`} className="block flex-shrink-0">
        <div className="aspect-video bg-gray-700 overflow-hidden relative">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <span className="text-4xl mb-1">📦</span>
              <span className="text-gray-500 text-xs">No image</span>
            </div>
          )}
          {/* Status badge overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-900/80 text-red-300 border border-red-700/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Sold
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={`/marketplace/${id}`}
            className="text-white font-semibold hover:text-indigo-400 transition-colors line-clamp-2 flex-1 text-sm leading-snug"
          >
            {title}
          </Link>
          <span
            className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
              isAvailable
                ? 'bg-green-900/40 text-green-400 border-green-700/40'
                : 'bg-red-900/40 text-red-400 border-red-700/40'
            }`}
          >
            {isAvailable ? 'Available' : 'Sold'}
          </span>
        </div>

        <p className="text-indigo-400 font-bold text-xl mb-3">{formatPrice(price)}</p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            {seller && (
              <p className="text-gray-500 text-xs">
                By{' '}
                <Link
                  to={`/profile/${seller.id}`}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  {seller.name}
                </Link>
              </p>
            )}
            <p className="text-gray-600 text-xs mt-0.5">{formatDate(createdAt)}</p>
          </div>
          <Link
            to={`/marketplace/${id}`}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceItemCard
