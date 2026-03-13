import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAllAsRead } from '../services/notificationService'
import { timeAgo } from '../utils/helpers'

function NotificationsDropdown({ onClose }) {
  const queryClient = useQueryClient()
  const dropdownRef = useRef(null)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  })

  const { mutate: markAll } = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <p className="text-white text-sm font-semibold">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll()}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const eventId = notif.eventId?._id || notif.eventId?.id || notif.eventId
            return (
              <Link
                key={notif._id || notif.id}
                to={`/events/${eventId}`}
                onClick={onClose}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/40 last:border-0 ${
                  !notif.read ? 'bg-indigo-900/10' : ''
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-700/40 flex items-center justify-center text-sm">
                  📅
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-snug ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                    {notif.message}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1" />
                )}
              </Link>
            )
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-700">
          <Link
            to="/events"
            onClick={onClose}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
          >
            View all events →
          </Link>
        </div>
      )}
    </div>
  )
}

export default NotificationsDropdown
