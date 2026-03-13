import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { listWorkspaces, createWorkspace, deleteWorkspace } from '../services/workspaceService'
import { getConnections } from '../services/connectionService'
import { getInitials, formatDate } from '../utils/helpers'

function WorkspacePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces,
  })

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createWorkspace,
    onSuccess: (ws) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      setShowCreate(false)
      setName('')
      setSelectedMembers([])
      setSearchQuery('')
      navigate(`/workspace/${ws._id || ws.id}`)
    },
  })

  const { mutate: remove, isPending: deleting, variables: deletingId } = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      setDeleteConfirmId(null)
    },
  })

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  // Filter connections based on search query
  const filteredConnections = connections.filter((conn) => {
    const user = conn.user
    const name = user.name || ''
    const skills = Array.isArray(user.skills) ? user.skills.join(' ') : ''
    const searchText = `${name} ${skills}`.toLowerCase()
    return searchText.includes(searchQuery.toLowerCase())
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    create({ name: name.trim(), memberIds: selectedMembers })
  }

  const myId = currentUser?._id || currentUser?.id

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">🗂 Workspaces</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Collaborative whiteboards for brainstorming with your team
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
              >
                + New Workspace
              </button>
            </div>

            {/* Create modal */}
            {showCreate && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 border border-gray-700/60 rounded-2xl w-full max-w-md shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60">
                    <h2 className="text-white font-bold text-lg">Create Workspace</h2>
                    <button
                      onClick={() => { setShowCreate(false); setName(''); setSelectedMembers([]); setSearchQuery('') }}
                      className="text-gray-400 hover:text-white text-xl transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreate} className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Workspace Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Hackathon Brainstorm, UI Planning..."
                        className="w-full bg-gray-700 border border-gray-600 focus:border-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
                      />
                    </div>

                    {/* Member selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Invite Connections{' '}
                        <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      {connections.length === 0 ? (
                        <p className="text-gray-500 text-xs py-3">
                          No connections yet.{' '}
                          <Link to="/connections" className="text-indigo-400 hover:underline">
                            Connect with students
                          </Link>{' '}
                          first.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {/* Search input */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search connections by name or skills..."
                              className="w-full bg-gray-700 border border-gray-600 focus:border-indigo-500 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
                            />
                          </div>

                          {/* Connection list */}
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {filteredConnections.length === 0 ? (
                              <p className="text-gray-500 text-xs py-3 text-center">
                                {searchQuery ? `No connections found matching "${searchQuery}"` : 'No connections available'}
                              </p>
                            ) : (
                              filteredConnections.map((conn) => {
                                const u = conn.user
                                const uid = u._id || u.id
                                const selected = selectedMembers.includes(uid)
                                return (
                                  <button
                                    key={uid}
                                    type="button"
                                    onClick={() => toggleMember(uid)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                                      selected
                                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                                        : 'bg-gray-700/50 border-gray-600/40 text-gray-300 hover:bg-gray-700'
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0">
                                      {u.avatarUrl
                                        ? <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                                        : <span>{getInitials(u.name || '')}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="block text-sm font-medium truncate">{u.name}</span>
                                      {u.skills && u.skills.length > 0 && (
                                        <span className="block text-xs text-gray-400 truncate">
                                          {u.skills.slice(0, 3).join(', ')}
                                          {u.skills.length > 3 && ` +${u.skills.length - 3} more`}
                                        </span>
                                      )}
                                    </div>
                                    {selected && <span className="text-indigo-400 text-xs">✓ Added</span>}
                                  </button>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!name.trim() || creating}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all"
                    >
                      {creating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : 'Create & Open'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Workspace list */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 animate-pulse">
                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-4" />
                    <div className="flex gap-1.5 mb-4">
                      {[1, 2].map((j) => <div key={j} className="w-7 h-7 bg-gray-700 rounded-full" />)}
                    </div>
                    <div className="h-8 bg-gray-700 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              <div className="text-center py-20 bg-gray-800 border border-gray-700/60 rounded-2xl">
                <p className="text-5xl mb-4">🗂</p>
                <p className="text-white font-semibold text-lg">No workspaces yet</p>
                <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                  Create a workspace and invite teammates to brainstorm with Excalidraw.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  + Create Your First Workspace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((ws) => {
                  const isOwner = (ws.creatorId?._id || ws.creatorId) === myId ||
                    ws.creatorId?._id?.toString() === myId?.toString()
                  const allMembers = [ws.creatorId, ...(ws.members || [])].filter(Boolean)

                  return (
                    <div
                      key={ws._id || ws.id}
                      className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-base truncate flex-1 pr-2">
                          {ws.name}
                        </h3>
                        {isOwner && deleteConfirmId === ws._id ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => remove(ws._id)}
                              disabled={deleting && deletingId === ws._id}
                              className="text-xs text-red-400 hover:text-red-300 font-medium"
                            >
                              {deleting && deletingId === ws._id ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs text-gray-500 hover:text-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : isOwner ? (
                          <button
                            onClick={() => setDeleteConfirmId(ws._id)}
                            className="text-gray-600 hover:text-red-400 text-sm transition-colors flex-shrink-0"
                          >
                            🗑
                          </button>
                        ) : null}
                      </div>

                      <p className="text-gray-500 text-xs mb-3">
                        Updated {formatDate(ws.updatedAt)}
                      </p>

                      {/* Member avatars */}
                      <div className="flex items-center mb-4">
                        <div className="flex -space-x-2">
                          {allMembers.slice(0, 5).map((m, idx) => (
                            <div
                              key={m?._id || idx}
                              className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-gray-800 flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden"
                            >
                              {m?.avatarUrl
                                ? <img src={m.avatarUrl} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                                : <span>{getInitials(m?.name || '')}</span>}
                            </div>
                          ))}
                          {allMembers.length > 5 && (
                            <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-gray-400 text-[10px] font-semibold">
                              +{allMembers.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-gray-500 text-xs ml-2">
                          {allMembers.length} {allMembers.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      <Link
                        to={`/workspace/${ws._id || ws.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white font-medium py-2 rounded-lg text-sm transition-all"
                      >
                        ✏️ Open Whiteboard
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default WorkspacePage
