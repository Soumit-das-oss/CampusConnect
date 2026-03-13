import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import useUserStore from '../store/userStore'

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

function useSocket() {
  const token = useUserStore((state) => state.token)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const updateUser = useUserStore((state) => state.updateUser)
  const setResumeAiAnalyzing = useUserStore((state) => state.setResumeAiAnalyzing)
  const queryClient = useQueryClient()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      // Connected to college room via server-side join
    })

    socket.on('new_event', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    })

    // Incoming chat message from another user
    socket.on('new_message', ({ message, sender }) => {
      const senderId = sender?._id || message?.senderId?.toString()
      // Append to the open conversation cache if it's already loaded
      if (senderId) {
        queryClient.setQueryData(['messages', senderId], (old) => {
          if (!old) return old
          const already = old.messages.some((m) => m._id === message._id)
          if (already) return old
          return { ...old, messages: [...old.messages, message] }
        })
      }
      // Refresh conversations list so unread badge + last message update
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    })

    // AI resume extraction completed in background on the server
    socket.on('resume:analyzed', ({ resumeData, skills, error }) => {
      setResumeAiAnalyzing(false)
      if (resumeData) {
        updateUser({ resumeData, skills })
      }
      if (error) {
        console.warn('[Resume AI] Background extraction failed:', error)
      }
    })

    socket.on('connect_error', () => {
      // Silently ignore connection errors (backend might be down)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, token, queryClient, updateUser, setResumeAiAnalyzing])
}

export default useSocket
