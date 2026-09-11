import api from './api'

// Returns the list of content items (metadata only - no storage URLs).
export async function listContent() {
  const res = await api.get('/content')
  return res.data.content
}

// Uploads a new content item together with its file (multipart/form-data).
export async function createContent(formData) {
  const res = await api.post('/content', formData)
  return res.data.content
}