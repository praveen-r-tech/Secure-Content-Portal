import { Link } from 'react-router-dom'

function ContentCard({ item }) {
  return (
    <li className="content-item">
      <div className="content-item-body">
        <h2 className="content-item-title">{item.title}</h2>
        {item.description && <p className="content-item-desc">{item.description}</p>}
        <span className="content-type">{item.type}</span>
      </div>
      <div className="content-item-side">
        <Link to={`/content/${item.id}`} className="btn-small">
          Open
        </Link>
      </div>
    </li>
  )
}

export default ContentCard