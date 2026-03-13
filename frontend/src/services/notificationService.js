import api from './api'

export const getNotifications = async () => {
  const response = await api.get('/notifications')
  return response.data.data.notifications
}

export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`)
  return response.data.data.notification
}

export const markAllAsRead = async () => {
  await api.patch('/notifications/read-all')
}
