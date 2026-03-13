import api from './api'

export const sendRequest = async (userId) => {
  // Backend expects { receiverId }, not { userId }
  const response = await api.post('/connections/send', { receiverId: userId })
  return response.data.data.connection
}

export const acceptRequest = async (id) => {
  const response = await api.post(`/connections/accept/${id}`)
  return response.data.data.connection
}

export const rejectRequest = async (id) => {
  const response = await api.post(`/connections/reject/${id}`)
  return response.data.data.connection
}

export const getConnections = async () => {
  const response = await api.get('/connections')
  // Backend: { success, count, data: { connections: [{ connectionId, connectedAt, user }] } }
  return response.data.data.connections
}

export const getPendingRequests = async () => {
  const response = await api.get('/connections/pending')
  // Backend: { success, count, data: { requests: [{ _id, senderId: {...}, receiverId, status }] } }
  return response.data.data.requests
}
