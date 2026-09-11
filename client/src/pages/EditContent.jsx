import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getContent, updateContent } from '../services/contentService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function EditContent() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [item, setItem] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getContent(id)
      .then((content) => {
        setItem(content)
        setTitle(content.title)
        setDescription(content.description)
        setCategory(content.category)
      })
      .catch((err) => setLoadError(err.response?.data?.message || 'Unable to load content.'))
  }, [id])

  if (loadError) {
    return <ErrorMessage message={loadError} />
  }

  if (!item) {
    return <Loading />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await updateContent(id, { title, description, category })
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save changes.')
      setSaving(false)
    }
  }

  return (
    <div className="edit-page">
      <h1>Edit Content</h1>
      {error && <ErrorMessage message={error} />}
      <form className="content-form" onSubmit={handleSubmit}>
        <p className="form-hint">File type: {item.type}. Only metadata can be edited here.</p>
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
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default EditContent