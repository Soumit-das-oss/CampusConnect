import api from './api'

export const getUsers = async (skills) => {
  const params = skills ? { skills } : {}
  const response = await api.get('/users', { params })
  // Backend: { success, count, data: { users: [...] } }
  return response.data.data.users
}

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`)
  // Backend: { success, data: { user } }
  return response.data.data.user
}

export const updateProfile = async (data) => {
  const response = await api.patch('/users/profile', data)
  return response.data.data.user
}

export const uploadResume = async (formData) => {
  const response = await api.post('/users/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}

export const deleteResume = async () => {
  const response = await api.delete('/users/resume')
  return response.data.data
}

export const uploadAvatar = async (formData) => {
  const response = await api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}
