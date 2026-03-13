import api from './api'

export const getEvents = async () => {
  const response = await api.get('/events')
  return response.data.data.events
}

export const createEvent = async (data) => {
  const response = await api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data.event
}

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`)
  return response.data.data.event
}
