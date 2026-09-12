import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listContent } from '../services/contentService'
import ContentCard from '../components/ContentCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function Home() {
  const { user } = useAuth()
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    listContent()
      .then(setContent)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load content.'))
  }, [])

  const categories = useMemo(() => {
    if (!content) return []
    const set = new Set(content.map((c) => c.category).filter(Boolean))
    return Array.from(set)
  }, [content])

  const filteredContent = useMemo(() => {
    if (!content) return []
    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = selectedType === 'all' || item.type === selectedType
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      return matchesSearch && matchesType && matchesCategory
    })
  }, [content, searchTerm, selectedType, selectedCategory])

  const displayName = user?.name || user?.email || 'there'

  return (
    <div className="home">
      <div className="home-header">
        <div>
          <h1>Welcome, {displayName.split(' ')[0]}</h1>
          <p className="muted">Explore training and reference content inside the portal.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && !content && <Loading />}

      {content && (
        <div className="catalog-toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by title or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <span className="filter-label">Type:</span>
              <button
                type="button"
                className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedType('all')}
              >
                All
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

            {categories.length > 1 && (
              <div className="filter-group">
                <span className="filter-label">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {content && content.length === 0 && (
        <p className="empty-state">No content published yet. Check back soon!</p>
      )}

      {content && content.length > 0 && filteredContent.length === 0 && (
        <p className="empty-state">No items matched your search criteria.</p>
      )}

      {filteredContent.length > 0 && (
        <ul className="content-list">
          {filteredContent.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default Home