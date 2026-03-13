import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { getEventById } from '../services/eventService'
import { formatDate, getInitials } from '../utils/helpers'

const CATEGORY_COLORS = {
  hackathon: 'bg-purple-900/40 text-purple-400 border-purple-700/40',
  workshop: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
  seminar: 'bg-cyan-900/40 text-cyan-400 border-cyan-700/40',
  cultural: 'bg-pink-900/40 text-pink-400 border-pink-700/40',
  sports: 'bg-green-900/40 text-green-400 border-green-700/40',
  other: 'bg-gray-700/60 text-gray-400 border-gray-600/40',
}

function EventDetailPage() {
  const { id } = useParams()

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="max-w-3xl mx-auto animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-40 mb-6" />
              <div className="h-64 bg-gray-800 rounded-xl mb-6" />
              <div className="h-7 bg-gray-700 rounded w-3/4 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded" />
                <div className="h-4 bg-gray-700 rounded" />
                <div className="h-4 bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="text-center py-16">
              <p className="text-5xl mb-4">😕</p>
              <p className="text-white font-semibold text-lg">Event not found</p>
              <Link to="/events" className="mt-5 inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                ← Back to Events
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const colorClass = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other
  const isPast = new Date(event.date) < new Date()
  const organizer = event.organizer

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              ← Back to Events
            </Link>

            {/* Banner */}
            <div className="h-56 bg-gradient-to-br from-indigo-900/60 via-gray-800 to-violet-900/40 rounded-xl overflow-hidden mb-6 relative">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-7xl opacity-30">📅</span>
                </div>
              )}
              <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full border ${colorClass}`}>
                {event.category === 'other' && event.customCategory
                  ? event.customCategory
                  : event.category || 'other'}
              </span>
              {isPast && (
                <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-gray-900/80 text-gray-400 border border-gray-600/40">
                  Ended
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">{event.title}</h1>

            {/* Meta info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-800 border border-gray-700/60 rounded-lg px-4 py-3">
                <p className="text-gray-500 text-xs mb-1">Date & Time</p>
                <p className="text-indigo-400 font-medium text-sm">🗓 {formatDate(event.date)}</p>
              </div>
              {event.venue && (
                <div className="bg-gray-800 border border-gray-700/60 rounded-lg px-4 py-3">
                  <p className="text-gray-500 text-xs mb-1">Venue</p>
                  <p className="text-white font-medium text-sm">📍 {event.venue}</p>
                </div>
              )}
            </div>

            {/* Meet link */}
            {event.meetLink && (
              <a
                href={event.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-indigo-600/10 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-600/20 rounded-xl px-5 py-3.5 mb-6 transition-colors group"
              >
                <span className="text-2xl">🔗</span>
                <div className="flex-1 min-w-0">
                  <p className="text-indigo-400 font-semibold text-sm group-hover:text-indigo-300">Join Meeting / Online Event</p>
                  <p className="text-gray-500 text-xs truncate mt-0.5">{event.meetLink}</p>
                </div>
                <span className="text-indigo-500 text-xs font-medium flex-shrink-0">Open →</span>
              </a>
            )}

            {/* Description */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 mb-5">
              <h2 className="text-gray-300 font-semibold text-sm mb-3">About this event</h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Organizer */}
            {organizer && (
              <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4">
                <p className="text-gray-500 text-xs font-medium mb-3">Organized by</p>
                <Link to={`/profile/${organizer._id || organizer.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                    {organizer.avatarUrl ? (
                      <img src={organizer.avatarUrl} alt={organizer.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span>{getInitials(organizer.name || '')}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm group-hover:text-indigo-400 transition-colors">{organizer.name}</p>
                    <p className="text-indigo-400 text-xs">Committee Head · View Profile →</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default EventDetailPage
