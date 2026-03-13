import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import EventCard from '../components/EventCard'
import useAuth from '../hooks/useAuth'
import { getEvents } from '../services/eventService'

function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-700" />
      <div className="p-4">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
        <div className="h-3 bg-gray-700 rounded w-1/2 mb-1" />
        <div className="h-3 bg-gray-700 rounded w-2/3 mb-3" />
        <div className="h-3 bg-gray-700 rounded" />
        <div className="h-3 bg-gray-700 rounded w-5/6 mt-1" />
      </div>
    </div>
  )
}

function EventsPage() {
  const { user } = useAuth()
  const isCommittee = user?.role === 'committee'

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date())
  const pastEvents = events.filter((e) => new Date(e.date) < new Date())

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Campus Events</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Stay updated with events happening at your college.
              </p>
            </div>
            {isCommittee && (
              <Link
                to="/events/create"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
              >
                📢 Broadcast Event
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
              <p className="text-5xl mb-4">📅</p>
              <p className="text-white font-semibold text-lg">No events yet</p>
              <p className="text-gray-400 mt-2 text-sm">
                {isCommittee
                  ? 'Be the first to broadcast an event to your campus!'
                  : 'No events have been announced yet. Check back soon!'}
              </p>
              {isCommittee && (
                <Link
                  to="/events/create"
                  className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  📢 Create First Event
                </Link>
              )}
            </div>
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-white font-semibold text-base mb-4">
                    Upcoming Events
                    <span className="ml-2 text-xs text-indigo-400 font-normal">{upcomingEvents.length}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id || event._id} event={event} />
                    ))}
                  </div>
                </section>
              )}

              {pastEvents.length > 0 && (
                <section>
                  <h2 className="text-gray-400 font-semibold text-base mb-4">
                    Past Events
                    <span className="ml-2 text-xs text-gray-500 font-normal">{pastEvents.length}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-70">
                    {pastEvents.map((event) => (
                      <EventCard key={event.id || event._id} event={event} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default EventsPage
