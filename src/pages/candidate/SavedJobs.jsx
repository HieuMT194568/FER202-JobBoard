import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Alert, Spinner } from 'react-bootstrap'
import { jobApi } from '../../api/services'
import { useSavedJobs } from '../../context/SavedJobsContext'
import JobCard from '../../components/JobCard'

function SavedJobs() {
  // Danh sách id việc đã lưu lấy từ localStorage, thông tin job lấy từ JSON Server
  const { isSaved } = useSavedJobs()
  const [allJobs, setAllJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobApi
      .getAll()
      .then(setAllJobs)
      .finally(() => setLoading(false))
  }, [])

  // Bỏ qua tin đã bị xóa; bỏ lưu thì tin biến mất khỏi danh sách ngay
  const jobs = allJobs.filter((job) => isSaved(job.id))

  return (
    <>
      <h3 className="mb-3">Việc làm đã lưu</h3>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : jobs.length === 0 ? (
        <Alert variant="info">
          Bạn chưa lưu việc làm nào. <Link to="/jobs">Khám phá việc làm</Link>
        </Alert>
      ) : (
        <Row className="g-3">
          {jobs.map((job) => (
            <Col key={job.id} md={6} lg={4}>
              <JobCard job={job} />
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}

export default SavedJobs
