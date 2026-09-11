import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listContent, deleteContent } from '../services/contentService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function AdminDashboard() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)
  // When set to an item id, that item shows a confirmation instead of Delete
  // (two-click delete prevents accidental removal).
  const [confirmingId, setConfirmingId] = useState(null)

  useEffect(() => {
    listContent()
      .then(setContent)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load content.'))
  }, [])

  const handleDelete = (id) => {
    deleteContent(id)
      .then(() => {
        setContent(content.filter((item) => item.id !== id))
        setConfirmingId(null)
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to delete content.'))
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!content) {
    return <Loading />
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <Link to="/admin/upload" className="btn-primary">
        Upload Content
      </Link>

      {content.length === 0 && (
        <p className="empty-state">No content yet. Upload your first item.</p>
      )}

      {content.length > 0 && (
        <ul className="content-list">
          {content.map((item) => (
            <li key={item.id} className="content-item">
              <div className="content-item-body">
                <h2 className="content-item-title">{item.title}</h2>
                <p className="content-item-desc">{item.description}</p>
              </div>
              <div className="content-item-side">
                <span className="content-type">{item.type}</span>
                <div className="content-item-actions">
                  <Link to={`/admin/edit/${item.id}`} className="btn-small">
                    Edit
                  </Link>
                  {confirmingId === item.id ? (
                    <>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={() => setConfirmingId(item.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminDashboard