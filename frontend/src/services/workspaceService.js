import api from './api'

export const listWorkspaces = async () => {
  const res = await api.get('/workspaces')
  return res.data.data.workspaces
}

export const createWorkspace = async ({ name, memberIds = [] }) => {
  const res = await api.post('/workspaces', { name, memberIds })
  return res.data.data.workspace
}

export const getWorkspace = async (id) => {
  const res = await api.get(`/workspaces/${id}`)
  return res.data.data.workspace
}

export const saveCanvas = async ({ id, elements, appState }) => {
  const res = await api.patch(`/workspaces/${id}/canvas`, { elements, appState })
  return res.data
}

export const addMember = async ({ workspaceId, userId }) => {
  const res = await api.post(`/workspaces/${workspaceId}/members`, { userId })
  return res.data.data.members
}

export const deleteWorkspace = async (id) => {
  const res = await api.delete(`/workspaces/${id}`)
  return res.data
}
