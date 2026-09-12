import { Link } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { listContent, deleteContent, getAuditLogs } from '../services/contentService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function AdminDashboard() {
  const [content, setContent] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [error, setError] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    listContent()
      .then(setContent)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load content.'))

    getAuditLogs()
      .then(setAuditLogs)
      .catch(() => {})
  }, [])

  const handleDelete = (id) => {
    deleteContent(id)
      .then(() => {
        setContent(content.filter((item) => item.id !== id))
        setConfirmingId(null)
        // Refresh audit logs
        getAuditLogs().then(setAuditLogs).catch(() => {})
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to delete content.'))
  }

  const filteredContent = useMemo(() => {
    if (!content) return []
    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = selectedType === 'all' || item.type === selectedType
      return matchesSearch && matchesType
    })
  }, [content, searchTerm, selectedType])

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!content) {
    return <Loading />
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-top-bar">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">Manage portal training content and inspect usage & audit metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? 'Hide Audit Log' : 'View Audit Log'}
          </button>
          <Link to="/admin/upload" className="btn-primary">
            + Upload New Content
          </Link>
        </div>
      </div>

      {showLogs && (
        <div className="audit-log-panel">
          <h2>Activity & Audit History</h2>
          {auditLogs.length === 0 ? (
            <p className="muted">No admin actions recorded yet.</p>
          ) : (
            <div className="audit-table-wrap">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Target Title</th>
                    <th>Performed By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className={`log-badge log-${log.action}`}>
                          {log.action.toUpperCase()}
                        </span>
                      </td>
                      <td>{log.targetTitle}</td>
                      <td>{log.performedBy?.email || 'Admin'}</td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="catalog-toolbar" style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Filter admin items…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="filters-row">
          <div className="filter-group">
            <button
              type="button"
              className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedType('all')}
            >
              All ({content.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedType === 'video' ? 'active' : ''}`}
              onClick={() => setSelectedType('video')}
            >
              Videos
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedType === 'pdf' ? 'active' : ''}`}
              onClick={() => setSelectedType('pdf')}
            >
              PDFs
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedType === 'html' ? 'active' : ''}`}
              onClick={() => setSelectedType('html')}
            >
              HTML
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedType === 'markdown' ? 'active' : ''}`}
              onClick={() => setSelectedType('markdown')}
            >
              Markdown
            </button>
          </div>
        </div>
      </div>

      {content.length === 0 && (
        <p className="empty-state">No content uploaded yet. Click "+ Upload New Content" to publish your first item.</p>
      )}

      {content.length > 0 && filteredContent.length === 0 && (
        <p className="empty-state">No items matching your search.</p>
      )}

      {filteredContent.length > 0 && (
        <ul className="content-list">
          {filteredContent.map((item) => (
            <li key={item.id} className="content-item">
              <div className="content-item-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 className="content-item-title">{item.title}</h2>
                  <span className="content-type">{item.type}</span>
                </div>
                {item.description && <p className="content-item-desc">{item.description}</p>}
                <div className="admin-usage-metrics">
                  <span className="metric-tag">
                    👁️ {item.viewCount || 0} views
                  </span>
                  <span className="metric-tag">
                    🕒 Last viewed: {item.lastViewedAt ? new Date(item.lastViewedAt).toLocaleDateString() : 'Never'}
                  </span>
                  <span className="metric-tag category-tag">
                    🏷️ {item.category}
                  </span>
                </div>
              </div>

              <div className="content-item-side">
                <div className="content-item-actions">
                  <Link to={`/content/${item.id}`} className="btn-small">
                    Preview
                  </Link>
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
                        Confirm Delete
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