import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendRequest } from '../services/connectionService'

function ConnectionButton({ userId, connectionStatus }) {
  const queryClient = useQueryClient()
  const [justSent, setJustSent] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => sendRequest(userId),
    onSuccess: () => {
      setJustSent(true)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      
      // Reset the "just sent" state after 3 seconds
      setTimeout(() => setJustSent(false), 3000)
    },
  })

  if (connectionStatus === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-900/30 border border-green-700/40 text-green-400 rounded-lg text-xs font-medium">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Connected
      </span>
    )
  }

  if (connectionStatus === 'pending' || justSent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-900/30 border border-yellow-700/40 text-yellow-400 rounded-lg text-xs font-medium">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
        </svg>
        {justSent ? 'Request Sent' : 'Pending'}
      </span>
    )
  }

  if (connectionStatus === 'rejected') {
    return (
      <button
        onClick={() => mutate()}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 hover:bg-indigo-600 border border-gray-600 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded-lg text-xs font-medium transition-all"
      >
        {isPending ? (
          <>
            <span className="inline-block w-3 h-3 border border-t-white border-white/30 rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          '+ Connect'
        )}
      </button>
    )
  }

  // Default: no connection yet
  return (
    <button
      onClick={() => mutate()}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all shadow-sm shadow-indigo-600/30"
    >
      {isPending ? (
        <>
          <span className="inline-block w-3 h-3 border border-t-white border-white/30 rounded-full animate-spin" />
          Sending...
        </>
      ) : (
        '+ Connect'
      )}
    </button>
  )
}

export default ConnectionButton
