import { Link } from 'react-router-dom'
import { formatDate, getInitials } from '../utils/helpers'

const CATEGORY_COLORS = {
  hackathon: 'bg-purple-900/40 text-purple-400 border-purple-700/40',
  workshop: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
  seminar: 'bg-cyan-900/40 text-cyan-400 border-cyan-700/40',
  cultural: 'bg-pink-900/40 text-pink-400 border-pink-700/40',
  sports: 'bg-green-900/40 text-green-400 border-green-700/40',
  other: 'bg-gray-700/60 text-gray-400 border-gray-600/40',
}

function EventCard({ event }) {
  const { id, _id, title, description, date, venue, category, organizer, imageUrl } = event
  const eventId = id || _id
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  const isPast = new Date(date) < new Date()

  return (
    <Link
      to={`/events/${eventId}`}
      className="block bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden hover:border-indigo-500/60 transition-all hover:shadow-lg hover:shadow-indigo-900/20 group"
    >
      {/* Image or gradient banner */}
      <div className="h-32 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 via-gray-800 to-violet-900/40 flex items-center justify-center">
            <span className="text-5xl opacity-40">📅</span>
          </div>
        )}
        {/* Category badge */}
        <span className={`absolute top-2 left-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colorClass}`}>
          {category || 'other'}
        </span>
        {isPast && (
          <span className="absolute top-2 right-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-900/70 text-gray-400 border border-gray-600/40">
            Ended
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors mb-2">
          {title}
        </h3>

        <div className="space-y-1 mb-3">
          <p className="text-indigo-400 text-xs font-medium">
            🗓 {formatDate(date)}
          </p>
          {venue && (
            <p className="text-gray-500 text-xs truncate">
              📍 {venue}
            </p>
          )}
        </div>

        {description && (
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        )}

        {/* Organizer */}
        {organizer && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-700/40">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0">
              {organizer.avatarUrl ? (
                <img src={organizer.avatarUrl} alt={organizer.name} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(organizer.name || '')}</span>
              )}
            </div>
            <span className="text-gray-500 text-xs truncate">{organizer.name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default EventCard
