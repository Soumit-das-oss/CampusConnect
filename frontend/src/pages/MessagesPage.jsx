import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { getConversations, getMessages, sendMessage } from '../services/messageService'
import { getInitials, formatDate } from '../utils/helpers'

function MessagesPage() {
  const { userId: paramUserId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ── Conversations list ────────────────────────────────────────────────────
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: getConversations,
    refetchInterval: 15000, // poll every 15s as fallback
  })

  // ── Active chat ───────────────────────────────────────────────────────────
  const { data: chatData, isLoading: chatLoading } = useQuery({
    queryKey: ['messages', paramUserId],
    queryFn: () => getMessages(paramUserId),
    enabled: !!paramUserId,
  })

  const messages = chatData?.messages || []
  const otherUser = chatData?.otherUser || null

  // Invalidate conversations list when a chat loads (backend marks msgs read)
  useEffect(() => {
    if (chatData) {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  }, [chatData, queryClient])

  // ── Send message mutation ─────────────────────────────────────────────────
  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: ({ content }) => sendMessage({ userId: paramUserId, content }),
    onSuccess: (newMsg) => {
      // Optimistically append the message to the list
      queryClient.setQueryData(['messages', paramUserId], (old) => {
        if (!old) return old
        return { ...old, messages: [...old.messages, newMsg] }
      })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      setInput('')
    },
  })

  // ── Auto-scroll to bottom when messages change ────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Focus input when switching conversations ──────────────────────────────
  useEffect(() => {
    if (paramUserId) inputRef.current?.focus()
  }, [paramUserId])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    send({ content: input.trim() })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const formatMsgTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const myId = currentUser?._id || currentUser?.id

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

          {/* ── Left: Conversations list ────────────────────────────────── */}
          <div className={`${paramUserId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-700/60 bg-gray-900 flex-shrink-0`}>
            <div className="px-4 py-4 border-b border-gray-700/60">
              <h2 className="text-white font-bold text-lg">💬 Messages</h2>
              <p className="text-gray-500 text-xs mt-0.5">Your conversations</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="space-y-0.5 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-gray-700 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-700 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
                  <span className="text-5xl mb-3">💬</span>
                  <p className="text-gray-400 font-medium text-sm">No conversations yet</p>
                  <p className="text-gray-600 text-xs mt-1">Connect with students and start chatting</p>
                  <Link to="/connections" className="mt-4 text-indigo-400 hover:text-indigo-300 text-xs font-medium">
                    Browse Connections →
                  </Link>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {conversations.map((conv) => {
                    const isActive = paramUserId === (conv.user._id || conv.user.id)
                    const isMe = conv.lastMessage?.senderId?.toString() === myId?.toString()
                    return (
                      <button
                        key={conv._id}
                        onClick={() => navigate(`/messages/${conv.user._id || conv.user.id}`)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                          isActive ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-full bg-indigo-700 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                            {conv.user.avatarUrl ? (
                              <img src={conv.user.avatarUrl} alt={conv.user.name} className="w-11 h-11 rounded-full object-cover" />
                            ) : (
                              <span>{getInitials(conv.user.name || '')}</span>
                            )}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>
                              {conv.user.name}
                            </p>
                            <span className="text-gray-600 text-[11px] flex-shrink-0">
                              {formatMsgTime(conv.lastMessage?.createdAt)}
                            </span>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                            {isMe ? 'You: ' : ''}{conv.lastMessage?.content}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Chat window ──────────────────────────────────────── */}
          {!paramUserId ? (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-900/50">
              <span className="text-6xl mb-4">💬</span>
              <p className="text-white font-semibold text-lg">Select a conversation</p>
              <p className="text-gray-500 text-sm mt-1">Choose from your connections to start chatting</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-gray-900 min-w-0">

              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/60 flex-shrink-0">
                <button
                  onClick={() => navigate('/messages')}
                  className="md:hidden text-gray-400 hover:text-white mr-1 text-lg"
                >
                  ←
                </button>
                {chatLoading ? (
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-700" />
                    <div className="h-4 bg-gray-700 rounded w-32" />
                  </div>
                ) : otherUser ? (
                  <>
                    <Link to={`/profile/${otherUser._id}`} className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                        {otherUser.avatarUrl ? (
                          <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <span>{getInitials(otherUser.name || '')}</span>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">{otherUser.name}</p>
                    </Link>
                    <Link
                      to={`/profile/${otherUser._id}`}
                      className="ml-auto text-gray-500 hover:text-indigo-400 text-xs transition-colors"
                    >
                      View Profile →
                    </Link>
                  </>
                ) : null}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {chatLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <span className="text-4xl mb-3">👋</span>
                    <p className="text-gray-400 text-sm font-medium">No messages yet</p>
                    <p className="text-gray-600 text-xs mt-1">Say hi to start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMine = msg.senderId?.toString() === myId?.toString()
                      const prevMsg = messages[idx - 1]
                      const showDate =
                        !prevMsg ||
                        new Date(msg.createdAt).toDateString() !==
                          new Date(prevMsg.createdAt).toDateString()

                      return (
                        <div key={msg._id || idx}>
                          {showDate && (
                            <div className="flex items-center justify-center my-3">
                              <span className="text-gray-600 text-[11px] bg-gray-800 px-3 py-1 rounded-full">
                                {new Date(msg.createdAt).toLocaleDateString([], {
                                  weekday: 'long', month: 'short', day: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? 'bg-indigo-600 text-white rounded-br-sm'
                                  : 'bg-gray-800 text-gray-200 border border-gray-700/60 rounded-bl-sm'
                              }`}
                            >
                              <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-300' : 'text-gray-500'} text-right`}>
                                {formatMsgTime(msg.createdAt)}
                                {isMine && (
                                  <span className="ml-1">{msg.read ? ' ✓✓' : ' ✓'}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-700/60 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    maxLength={2000}
                    className="flex-1 bg-gray-800 border border-gray-700 focus:border-indigo-500 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600 resize-none transition-colors"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="flex-shrink-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all"
                  >
                    {sending ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="text-base">➤</span>
                    )}
                  </button>
                </form>
                <p className="text-gray-700 text-[10px] mt-1.5 text-right">{input.length}/2000</p>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default MessagesPage
