import api from './api'

export const getListings = async () => {
  const response = await api.get('/marketplace')
  // Backend: { success, count, data: { listings: [...] } }
  return response.data.data.listings
}

export const getListingById = async (id) => {
  const response = await api.get(`/marketplace/${id}`)
  // Backend: { success, data: { listing } }
  return response.data.data.listing
}

export const createListing = async (formData) => {
  const response = await api.post('/marketplace', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data.listing
}

export const markAsSold = async (id) => {
  const response = await api.patch(`/marketplace/${id}/sold`)
  return response.data.data.listing
}

export const deleteListing = async (id) => {
  const response = await api.delete(`/marketplace/${id}`)
  return response.data
}
