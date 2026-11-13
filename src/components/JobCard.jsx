import { Card, Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSavedJobs } from '../context/SavedJobsContext'
import { formatSalary, formatDate, isExpired } from '../utils/format'

function JobCard({ job, categoryName }) {
  const { user } = useAuth()
  const { isSaved, toggleSave } = useSavedJobs()
  const saved = isSaved(job.id)

  return (
    <Card className="h-100 shadow-sm job-card">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <Card.Title as={Link} to={`/jobs/${job.id}`} className="h6 text-decoration-none mb-1">
            {job.title}
          </Card.Title>
          {user?.role === 'candidate' && (
            <Button
              variant="link"
              className="p-0 text-danger"
              title={saved ? 'Bỏ lưu' : 'Lưu tin'}
              onClick={() => toggleSave(job.id)}
            >
              <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} />
            </Button>
          )}
        </div>
        <div className="text-muted small mb-2">
          <i className="bi bi-building me-1" />
          {job.companyName}
        </div>
        <div className="small mb-1">
          <i className="bi bi-geo-alt me-1" />
          {job.location}
        </div>
        <div className="small mb-2 text-success fw-semibold">
          <i className="bi bi-cash-coin me-1" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </div>
        <div className="mt-auto d-flex flex-wrap gap-1 align-items-center">
          <Badge bg="primary">{job.type}</Badge>
          {categoryName && <Badge bg="info">{categoryName}</Badge>}
          <span className={`ms-auto small ${isExpired(job.deadline) ? 'text-danger' : 'text-muted'}`}>
            Hạn: {formatDate(job.deadline)}
          </span>
        </div>
      </Card.Body>
    </Card>
  )
}

export default JobCard
