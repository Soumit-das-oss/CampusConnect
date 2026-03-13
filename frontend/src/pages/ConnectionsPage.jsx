import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import UserCard from '../components/UserCard'
import {
  getConnections,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
} from '../services/connectionService'
import { getInitials } from '../utils/helpers'

function SkeletonRow() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-40 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-28" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-700 rounded-lg w-20" />
        <div className="h-8 bg-gray-700 rounded-lg w-16" />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-16" />
        <div className="h-5 bg-gray-700 rounded-full w-20" />
      </div>
    </div>
  )
}

function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('connections')
  const queryClient = useQueryClient()

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  })

  const { data: pendingRequests = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['connections', 'pending'],
    queryFn: getPendingRequests,
  })

  const { mutate: accept, isPending: accepting, variables: acceptingId } = useMutation({
    mutationFn: acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const { mutate: reject, isPending: rejecting, variables: rejectingId } = useMutation({
    mutationFn: rejectRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
    },
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Connections</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage your campus network and respond to connection requests.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-800/60 border border-gray-700/60 rounded-xl p-1 mb-6 w-fit">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'connections'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔗 My Connections
              {connections.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                    activeTab === 'connections'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {connections.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📬 Pending Requests
              {pendingRequests.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                    activeTab === 'pending'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-yellow-900/60 text-yellow-400'
                  }`}
                >
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab: My Connections */}
          {activeTab === 'connections' && (
            <div>
              {connectionsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
                  <p className="text-5xl mb-4">🔗</p>
                  <p className="text-white font-semibold text-lg">No connections yet</p>
                  <p className="text-gray-400 mt-2 text-sm max-w-sm mx-auto">
                    Start connecting with students from your campus to grow your professional
                    network.
                  </p>
                  <Link
                    to="/team-finder"
                    className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    🔍 Find Students
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-4">
                    You have{' '}
                    <span className="text-white font-semibold">{connections.length}</span>{' '}
                    {connections.length === 1 ? 'connection' : 'connections'}.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.map((connection) => {
                      // Backend shape: { connectionId, connectedAt, user: { _id, name, ... } }
                      const connectedUser = connection.user

                      return (
                        <UserCard
                          key={connection.connectionId}
                          user={{ ...connectedUser, id: connectedUser._id, connectionStatus: 'accepted' }}
                        />
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Pending Requests */}
          {activeTab === 'pending' && (
            <div>
              {pendingLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
                  <p className="text-5xl mb-4">📭</p>
                  <p className="text-white font-semibold text-lg">No pending requests</p>
                  <p className="text-gray-400 mt-2 text-sm">
                    You're all caught up! Check back later for new connection requests.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-4">
                    You have{' '}
                    <span className="text-white font-semibold">{pendingRequests.length}</span>{' '}
                    pending{' '}
                    {pendingRequests.length === 1 ? 'request' : 'requests'}.
                  </p>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => {
                      // Backend shape: { _id, senderId: { _id, name, ... }, status }
                      const requester = request.senderId
                      const isAccepting = accepting && acceptingId === request._id
                      const isRejecting = rejecting && rejectingId === request._id

                      return (
                        <div
                          key={request._id}
                          className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-600 transition-colors"
                        >
                          <Link
                            to={`/profile/${requester._id}`}
                            className="flex items-center gap-4 group flex-1 min-w-0"
                          >
                            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500/50 transition-all">
                              {requester.avatarUrl ? (
                                <img
                                  src={requester.avatarUrl}
                                  alt={requester.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span>{getInitials(requester.name || '')}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold group-hover:text-indigo-400 transition-colors truncate">
                                {requester.name}
                              </p>
                              {requester.collegeId && (
                                <p className="text-indigo-400 text-xs font-medium truncate">
                                  {typeof requester.collegeId === 'object' ? requester.collegeId.name || requester.collegeId.domain : requester.collegeId}
                                </p>
                              )}
                              {requester.skills && requester.skills.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {requester.skills.slice(0, 3).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {requester.skills.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{requester.skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => accept(request._id)}
                              disabled={isAccepting || isRejecting}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              {isAccepting ? (
                                <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                              ) : (
                                '✓'
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => reject(request._id)}
                              disabled={isAccepting || isRejecting}
                              className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              {isRejecting ? (
                                <span className="w-4 h-4 border-2 border-t-gray-300 border-gray-600 rounded-full animate-spin" />
                              ) : (
                                '✕'
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ConnectionsPage
