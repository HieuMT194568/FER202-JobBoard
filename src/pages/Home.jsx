import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap'
import { jobApi, categoryApi, sameId } from '../api/services'
import JobCard from '../components/JobCard'
import { LOCATIONS } from '../utils/format'

function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([jobApi.getAll({ status: 'approved' }), categoryApi.getAll()])
      .then(([jobData, catData]) => {
        setJobs(jobData)
        setCategories(catData)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  const getCategoryName = (id) => categories.find((c) => sameId(c.id, id))?.name

  return (
    <>
      <section className="hero p-4 p-md-5 mb-4">
        <h1 className="fw-bold">Tìm công việc mơ ước của bạn</h1>
        <p className="lead mb-4">Hàng trăm việc làm từ các công ty hàng đầu đang chờ bạn ứng tuyển.</p>
        <Form onSubmit={handleSearch}>
          <Row className="g-2">
            <Col md={6}>
              <Form.Control
                size="lg"
                placeholder="Vị trí, kỹ năng, tên công ty..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select size="lg" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Tất cả địa điểm</option>
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-grid">
              <Button type="submit" size="lg" variant="warning">
                <i className="bi bi-search me-1" /> Tìm
              </Button>
            </Col>
          </Row>
        </Form>
      </section>

      <h4 className="mb-3">Ngành nghề nổi bật</h4>
      <Row className="g-3 mb-4">
        {categories.map((c) => (
          <Col key={c.id} xs={6} md={4} lg>
            <Card as={Link} to={`/jobs?categoryId=${c.id}`} className="text-center text-decoration-none h-100 job-card">
              <Card.Body>
                <div className="fw-semibold">{c.name}</div>
                <small className="text-muted">{jobs.filter((j) => sameId(j.categoryId, c.id)).length} việc làm</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Việc làm mới nhất</h4>
        <Link to="/jobs">Xem tất cả &raquo;</Link>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-3">
          {jobs.slice(0, 6).map((job) => (
            <Col key={job.id} md={6} lg={4}>
              <JobCard job={job} categoryName={getCategoryName(job.categoryId)} />
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}

export default Home
