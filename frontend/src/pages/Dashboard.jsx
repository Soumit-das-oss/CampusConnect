import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import UserCard from '../components/UserCard'
import useAuth from '../hooks/useAuth'
import { getUsers } from '../services/userService'
import { getConnections } from '../services/connectionService'
import { getListings } from '../services/marketplaceService'

function StatCard({ label, value, icon, href, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-900/40 border-indigo-700/40 text-indigo-400',
    green: 'bg-green-900/40 border-green-700/40 text-green-400',
    blue: 'bg-blue-900/40 border-blue-700/40 text-blue-400',
  }

  return (
    <Link
      to={href}
      className="bg-gray-800 border border-gray-700/60 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-900/20 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">
            {value !== undefined && value !== null ? value : '—'}
          </p>
          <p className="text-indigo-400 text-xs mt-2 group-hover:text-indigo-300 transition-colors">
            View all →
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-14" />
        <div className="h-5 bg-gray-700 rounded-full w-20" />
        <div className="h-5 bg-gray-700 rounded-full w-16" />
      </div>
      <div className="h-px bg-gray-700 mb-3" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-700 rounded w-20" />
        <div className="h-6 bg-gray-700 rounded w-16" />
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  })

  const { data: listings = [] } = useQuery({
    queryKey: ['marketplace'],
    queryFn: getListings,
  })

  const firstName = user?.name?.split(' ')[0] || 'Student'

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-full">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Here's what's happening in your campus community
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="My Connections"
              value={connections.length}
              icon="🔗"
              href="/connections"
              color="indigo"
            />
            <StatCard
              label="Marketplace Listings"
              value={listings.length}
              icon="🛒"
              href="/marketplace"
              color="blue"
            />
            <StatCard
              label="Students on Campus"
              value={users.length}
              icon="🎓"
              href="/team-finder"
              color="green"
            />
          </div>

          {/* Quick actions */}
          <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 mb-8">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/team-finder"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-600/20"
              >
                🔍 Find Teammates
              </Link>
              <Link
                to="/marketplace/create"
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                ➕ Create Listing
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                ✏️ Edit Profile
              </Link>
              <Link
                to="/connections"
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                🔗 View Connections
              </Link>
            </div>
          </div>

          {/* Recent Students */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Discover Students</h2>
              <Link
                to="/team-finder"
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                View all →
              </Link>
            </div>

            {usersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 border border-gray-700/60 rounded-xl">
                <p className="text-4xl mb-3">🎓</p>
                <p className="text-white font-semibold">No students found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Be the first to complete your profile and get discovered!
                </p>
                <Link
                  to="/profile"
                  className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Complete your profile →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.slice(0, 6).map((u) => (
                  <UserCard key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
