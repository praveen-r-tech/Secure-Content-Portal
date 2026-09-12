import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createContent } from '../services/contentService'
import ErrorMessage from '../components/ErrorMessage'

function UploadContent() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [type, setType] = useState('video')
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (!file) {
      setError('Please choose a file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('type', type)
    formData.append('file', file)

    setUploading(true)
    try {
      await createContent(formData)
      navigate('/admin')
    } catch (err) {
      // The backend is the source of truth for errors (validation, permissions).
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="upload-page">
      <h1>Upload Content</h1>
      {error && <ErrorMessage message={error} />}
      <form className="content-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </label>
        <label>
          Category
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="markdown">Markdown (.md)</option>
          </select>
          <span className="form-hint">The backend verifies the real type from the file itself.</span>
        </label>
        <label>
          File
          <input
            type="file"
            accept=".mp4,.pdf,.html,.md,.markdown,application/pdf,video/mp4,text/html,text/markdown,text/plain"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>
        <button type="submit" className="btn-primary" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    </div>
  )
}

export default UploadContent