import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import useUserStore from '../store/userStore'
import { getWorkspace, saveCanvas, addMember } from '../services/workspaceService'
import { getConnections } from '../services/connectionService'
import { getInitials } from '../utils/helpers'

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

const SAVE_DEBOUNCE_MS = 3000
const EMIT_DEBOUNCE_MS = 150

function WorkspaceDetailPage() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const token = useUserStore((s) => s.token)
  const queryClient = useQueryClient()

  const editorRef = useRef(null)
  const socketRef = useRef(null)
  const saveTimerRef = useRef(null)
  const emitTimerRef = useRef(null)
  const isRemoteUpdate = useRef(false)
  const unsubscribeRef = useRef(null)

  const [saved, setSaved] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)

  const { data: workspace, isLoading, error } = useQuery({
    queryKey: ['workspaces', id],
    queryFn: () => getWorkspace(id),
    enabled: !!id,
  })

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
    enabled: showAddMember,
  })

  // Parse saved tldraw snapshot (stored in `elements` field)
  const initialSnapshot = (() => {
    try { return JSON.parse(workspace?.elements || 'null') }
    catch { return null }
  })()

  // Socket.io setup
  useEffect(() => {
    if (!id || !token) return

    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => socket.emit('workspace:join', id))

    socket.on('workspace:draw', ({ snapshot }) => {
      if (!editorRef.current || !snapshot) return
      isRemoteUpdate.current = true
      try {
        editorRef.current.store.mergeRemoteChanges(() => {
          editorRef.current.loadSnapshot(snapshot)
        })
      } finally {
        isRemoteUpdate.current = false
      }
    })

    return () => {
      socket.emit('workspace:leave', id)
      socket.disconnect()
      socketRef.current = null
    }
  }, [id, token])

  // Called when tldraw mounts — gives us the editor instance
  const handleMount = useCallback((editor) => {
    editorRef.current = editor

    // Restore previously saved canvas
    if (initialSnapshot) {
      editor.loadSnapshot(initialSnapshot)
    }

    // Listen for user-driven changes and broadcast / persist them
    const unsub = editor.store.listen(
      () => {
        if (isRemoteUpdate.current) return

        setSaved(false)
        const snapshot = editor.getSnapshot()

        // Debounced real-time broadcast to peers
        clearTimeout(emitTimerRef.current)
        emitTimerRef.current = setTimeout(() => {
          socketRef.current?.emit('workspace:draw', { workspaceId: id, snapshot })
        }, EMIT_DEBOUNCE_MS)

        // Debounced save to database
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(async () => {
          try {
            await saveCanvas({ id, elements: JSON.stringify(snapshot), appState: '{}' })
            setSaved(true)
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
          } catch { /* silently retry on next change */ }
        }, SAVE_DEBOUNCE_MS)
      },
      { source: 'user', scope: 'document' }
    )

    unsubscribeRef.current = unsub
  }, [id, queryClient, initialSnapshot])

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(saveTimerRef.current)
    clearTimeout(emitTimerRef.current)
    unsubscribeRef.current?.()
  }, [])

  // Add member handler
  const handleAddMember = async (userId) => {
    try {
      await addMember({ workspaceId: id, userId })
      queryClient.invalidateQueries({ queryKey: ['workspaces', id] })
    } catch { /* user may already be a member */ }
  }

  const myId = currentUser?._id || currentUser?.id
  const isOwner =
    workspace?.creatorId?._id?.toString() === myId?.toString() ||
    workspace?.creatorId?.toString() === myId?.toString()

  const allMembers = workspace
    ? [workspace.creatorId, ...(workspace.members || [])].filter(Boolean)
    : []

  const existingMemberIds = new Set(allMembers.map((m) => (m._id || m).toString()))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-3">😕</p>
              <p className="text-white font-semibold">Workspace not found</p>
              <Link to="/workspace" className="mt-4 inline-block text-indigo-400 text-sm hover:underline">
                ← Back to Workspaces
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 pt-16 overflow-hidden">
        <Sidebar />

        <div className="flex-1 md:ml-64 flex flex-col overflow-hidden h-full">

          {/* Workspace toolbar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/60 bg-gray-900 flex-shrink-0 z-10">
            <Link to="/workspace" className="text-gray-400 hover:text-white text-sm transition-colors">
              ← Workspaces
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-white font-semibold text-sm truncate max-w-xs">{workspace.name}</h1>

            <span className={`text-xs ml-1 ${saved ? 'text-green-500' : 'text-yellow-500'}`}>
              {saved ? '● Saved' : '● Saving...'}
            </span>

            <div className="flex-1" />

            {/* Member avatars */}
            <div className="flex -space-x-2 items-center">
              {allMembers.slice(0, 4).map((m, idx) => (
                <div
                  key={m?._id || idx}
                  title={m?.name}
                  className="w-7 h-7 rounded-full bg-indigo-700 border-2 border-gray-900 flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden"
                >
                  {m?.avatarUrl
                    ? <img src={m.avatarUrl} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                    : <span>{getInitials(m?.name || '')}</span>}
                </div>
              ))}
              {allMembers.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-gray-400 text-[10px] font-semibold">
                  +{allMembers.length - 4}
                </div>
              )}
            </div>

            {isOwner && (
              <button
                onClick={() => setShowAddMember((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
              >
                + Add Member
              </button>
            )}
          </div>

          {/* Add member dropdown — portaled to body to escape tldraw stacking context */}
          {showAddMember && createPortal(
            <div className="fixed right-6 top-28 z-[9999] bg-gray-800 border border-gray-700/60 rounded-xl shadow-2xl w-64 p-3">
              <p className="text-gray-400 text-xs font-medium mb-2">Add from your connections</p>
              {connections.length === 0 ? (
                <p className="text-gray-500 text-xs py-2">No connections found.</p>
              ) : (
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {connections
                    .filter((c) => !existingMemberIds.has((c.user._id || c.user.id).toString()))
                    .map((conn) => {
                      const u = conn.user
                      const uid = u._id || u.id
                      return (
                        <button
                          key={uid}
                          onClick={() => { handleAddMember(uid); setShowAddMember(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-700 text-left transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0">
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                              : <span>{getInitials(u.name || '')}</span>}
                          </div>
                          <span className="text-gray-200 text-sm">{u.name}</span>
                        </button>
                      )
                    })}
                  {connections.every((c) => existingMemberIds.has((c.user._id || c.user.id).toString())) && (
                    <p className="text-gray-500 text-xs py-2 px-1">All your connections are already members.</p>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowAddMember(false)}
                className="mt-2 w-full text-center text-gray-500 hover:text-gray-300 text-xs"
              >
                Close
              </button>
            </div>
          , document.body)}

          {/* tldraw canvas — fills remaining height */}
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
            <Tldraw onMount={handleMount} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default WorkspaceDetailPage
