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
  const queryClient = useQueryClient()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    // Connect with auth token
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      // Connected to college room via server-side join
    })

    socket.on('new_event', () => {
      // Invalidate notifications so the bell updates
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      // Also refresh events list
      queryClient.invalidateQueries({ queryKey: ['events'] })
    })

    socket.on('connect_error', () => {
      // Silently ignore connection errors (backend might be down)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, token, queryClient])
}

export default useSocket
