import api from './api'

export const getResources = async (params = {}) => {
  const res = await api.get('/resources', { params })
  return res.data.data.resources
}

export const uploadResource = async (formData) => {
  const res = await api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data.resource
}

export const downloadResource = async (id) => {
  const res = await api.get(`/resources/download/${id}`)
  return res.data.data // { url, fileName }
}

export const deleteResource = async (id) => {
  const res = await api.delete(`/resources/${id}`)
  return res.data
}
