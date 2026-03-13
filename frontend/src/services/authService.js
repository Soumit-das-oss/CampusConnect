import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  // Backend returns: { success, token, data: { user } }
  return {
    user: response.data.data.user,
    token: response.data.token,
  }
}

export const register = async (name, email, password, role = 'student') => {
  const response = await api.post('/auth/register', { name, email, password, role })
  return {
    user: response.data.data.user,
    token: response.data.token,
  }
}

export const getMe = async () => {
  const response = await api.get('/auth/me')
  return response.data.data.user
}
