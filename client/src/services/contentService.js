import api from './api'

// Returns the list of content items (metadata only - no storage URLs).
export async function listContent() {
  const res = await api.get('/content')
  return res.data.content
}

// Returns a single content item by id.
export async function getContent(id) {
  const res = await api.get(`/content/${id}`)
  return res.data.content
}

// Uploads a new content item together with its file (multipart/form-data).
export async function createContent(formData) {
  const res = await api.post('/content', formData)
  return res.data.content
}

// Edits the metadata (title, description, category) of a content item.
export async function updateContent(id, data) {
  const res = await api.put(`/content/${id}`, data)
  return res.data.content
}

// Deletes a content item (file + metadata).
export async function deleteContent(id) {
  const res = await api.delete(`/content/${id}`)
  return res.data
}