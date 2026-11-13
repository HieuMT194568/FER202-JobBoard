import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Row, Col, Form, Button, Card, Spinner, Pagination, Alert } from 'react-bootstrap'
import { jobApi, categoryApi, sameId } from '../api/services'
import JobCard from '../components/JobCard'
import { JOB_TYPES, LOCATIONS } from '../utils/format'

const PAGE_SIZE = 6

function JobList() {
  // Bộ lọc lưu trên URL (?q=...&location=...) để có thể chia sẻ link / quay lại
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const type = searchParams.get('type') || ''
  const minSalary = searchParams.get('minSalary') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page')) || 1

  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState(q)

  useEffect(() => {
    Promise.all([jobApi.getAll({ status: 'approved' }), categoryApi.getAll()])
      .then(([jobData, catData]) => {
        setJobs(jobData)
        setCategories(catData)
      })
      .catch(() => setError('Không tải được dữ liệu. Hãy chắc chắn JSON Server đang chạy (npm run server).'))
      .finally(() => setLoading(false))
  }, [])

  // Đổi 1 tham số lọc, đồng thời quay về trang 1
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const filteredJobs = useMemo(() => {
    const kw = q.toLowerCase()
    const result = jobs.filter(
      (j) =>
        (!kw || j.title.toLowerCase().includes(kw) || j.companyName.toLowerCase().includes(kw)) &&
        (!location || j.location === location) &&
        (!categoryId || sameId(j.categoryId, categoryId)) &&
        (!type || j.type === type) &&
        (!minSalary || j.salaryMax >= Number(minSalary)),
    )
    if (sort === 'salary') result.sort((a, b) => b.salaryMax - a.salaryMax)
    else result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return result
  }, [jobs, q, location, categoryId, type, minSalary, sort])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE))
  const pageJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getCategoryName = (id) => categories.find((c) => sameId(c.id, id))?.name

  return (
    <Row className="g-4">
      <Col lg={3}>
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">
              <i className="bi bi-funnel me-1" /> Bộ lọc
            </h5>
            <Form
              onSubmit={(e) => {
                e.preventDefault()
                updateParam('q', keyword.trim())
              }}
            >
              <Form.Group className="mb-3">
                <Form.Label>Từ khóa</Form.Label>
                <Form.Control
                  placeholder="Tên việc, công ty..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </Form.Group>
            </Form>
            <Form.Group className="mb-3">
              <Form.Label>Ngành nghề</Form.Label>
              <Form.Select value={categoryId} onChange={(e) => updateParam('categoryId', e.target.value)}>
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa điểm</Form.Label>
              <Form.Select value={location} onChange={(e) => updateParam('location', e.target.value)}>
                <option value="">Tất cả</option>
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình thức</Form.Label>
              {['', ...JOB_TYPES].map((t) => (
                <Form.Check
                  key={t || 'all'}
                  type="radio"
                  id={`type-${t || 'all'}`}
                  name="type"
                  label={t || 'Tất cả'}
                  checked={type === t}
                  onChange={() => updateParam('type', t)}
                />
              ))}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mức lương tối thiểu</Form.Label>
              <Form.Select value={minSalary} onChange={(e) => updateParam('minSalary', e.target.value)}>
                <option value="">Tất cả</option>
                <option value="10">Từ 10 triệu</option>
                <option value="15">Từ 15 triệu</option>
                <option value="20">Từ 20 triệu</option>
                <option value="30">Từ 30 triệu</option>
              </Form.Select>
            </Form.Group>
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => {
                setKeyword('')
                setSearchParams({})
              }}
            >
              Xóa bộ lọc
            </Button>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={9}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Tìm thấy {filteredJobs.length} việc làm</h5>
          <Form.Select style={{ width: 200 }} value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="salary">Lương cao nhất</option>
          </Form.Select>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : pageJobs.length === 0 ? (
          <Alert variant="info">Không có việc làm phù hợp với bộ lọc.</Alert>
        ) : (
          <>
            <Row className="g-3">
              {pageJobs.map((job) => (
                <Col key={job.id} md={6} xl={4}>
                  <JobCard job={job} categoryName={getCategoryName(job.categoryId)} />
                </Col>
              ))}
            </Row>
            {totalPages > 1 && (
              <Pagination className="justify-content-center mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item key={p} active={p === page} onClick={() => updateParam('page', String(p))}>
                    {p}
                  </Pagination.Item>
                ))}
              </Pagination>
            )}
          </>
        )}
      </Col>
    </Row>
  )
}

export default JobList
