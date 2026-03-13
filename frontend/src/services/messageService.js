import api from './api'

export const getConversations = async () => {
  const res = await api.get('/messages')
  return res.data.data.conversations
}

export const getMessages = async (userId) => {
  const res = await api.get(`/messages/${userId}`)
  return res.data.data
}

export const sendMessage = async ({ userId, content }) => {
  const res = await api.post(`/messages/${userId}`, { content })
  return res.data.data.message
}

export const getUnreadCount = async () => {
  const res = await api.get('/messages/unread-count')
  return res.data.data.count
}
