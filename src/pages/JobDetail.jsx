import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Row, Col, Card, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap'
import { jobApi, applicationApi, sameId } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { useSavedJobs } from '../context/SavedJobsContext'
import { formatSalary, formatDate, isExpired, today } from '../utils/format'
import StatusBadge from '../components/StatusBadge'

const PHONE_REGEX = /^0\d{9}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateApplication(form) {
  const errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên'
  if (!EMAIL_REGEX.test(form.email)) errors.email = 'Email không hợp lệ'
  if (!PHONE_REGEX.test(form.phone)) errors.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
  if (!/^https?:\/\/.+/.test(form.cvLink)) errors.cvLink = 'Link CV phải bắt đầu bằng http:// hoặc https://'
  if (form.coverLetter.trim().length < 20) errors.coverLetter = 'Thư giới thiệu tối thiểu 20 ký tự'
  return errors
}

function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isSaved, toggleSave } = useSavedJobs()
  const saved = isSaved(id)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myApplication, setMyApplication] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', cvLink: '', coverLetter: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    jobApi
      .getById(id)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false))
  }, [id])

  // Kiểm tra ứng viên đã nộp đơn cho job này chưa
  useEffect(() => {
    if (user?.role === 'candidate') {
      applicationApi.findOne(id, user.id).then(setMyApplication)
    }
  }, [id, user])

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  // Tin chưa duyệt chỉ chủ tin và admin xem được
  const canView = job && (job.status === 'approved' || user?.role === 'admin' || sameId(user?.id, job.employerId))
  if (!canView)
    return (
      <Alert variant="warning">
        Không tìm thấy tin tuyển dụng. <Link to="/jobs">Quay lại danh sách</Link>
      </Alert>
    )

  const expired = isExpired(job.deadline)

  const openApply = () => {
    if (!user) return navigate('/login', { state: { from: `/jobs/${id}` } })
    setForm({ fullName: user.name, email: user.email, phone: user.phone || '', cvLink: '', coverLetter: '' })
    setErrors({})
    setShowModal(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateApplication(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const created = await applicationApi.create({
      ...form,
      jobId: job.id,
      candidateId: user.id,
      status: 'pending',
      createdAt: today(),
    })
    setMyApplication(created)
    setShowModal(false)
    setMessage('Nộp hồ sơ thành công! Nhà tuyển dụng sẽ liên hệ với bạn sớm.')
  }

  const renderApplyButton = () => {
    if (user && user.role !== 'candidate') return null
    if (myApplication)
      return (
        <div>
          Bạn đã ứng tuyển — trạng thái: <StatusBadge status={myApplication.status} />
        </div>
      )
    if (expired) return <Button disabled>Đã hết hạn nộp hồ sơ</Button>
    return (
      <Button size="lg" onClick={openApply}>
        <i className="bi bi-send me-1" />
        {user ? 'Ứng tuyển ngay' : 'Đăng nhập để ứng tuyển'}
      </Button>
    )
  }

  return (
    <>
      <Button variant="link" className="px-0 mb-2" onClick={() => navigate(-1)}>
        &laquo; Quay lại
      </Button>
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {job.status !== 'approved' && (
        <Alert variant="warning">
          Tin này đang ở trạng thái <StatusBadge status={job.status} /> nên chưa hiển thị công khai.
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h3>{job.title}</h3>
              <div className="text-muted mb-3">
                <i className="bi bi-building me-1" />
                {job.companyName}
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="primary">{job.type}</Badge>
                {job.category && <Badge bg="info">{job.category.name}</Badge>}
                {expired && <Badge bg="danger">Hết hạn</Badge>}
              </div>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                {renderApplyButton()}
                {user?.role === 'candidate' && (
                  <Button variant="outline-danger" onClick={() => toggleSave(job.id)}>
                    <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'} me-1`} />
                    {saved ? 'Đã lưu' : 'Lưu tin'}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h5>Mô tả công việc</h5>
              <p className="pre-line">{job.description}</p>
              <h5>Yêu cầu ứng viên</h5>
              <p className="pre-line">{job.requirements}</p>
              <h5>Quyền lợi</h5>
              <p className="pre-line mb-0">{job.benefits}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="fw-semibold">Thông tin chung</Card.Header>
            <Card.Body>
              <p>
                <i className="bi bi-cash-coin me-2 text-success" />
                <strong>Mức lương:</strong> {formatSalary(job.salaryMin, job.salaryMax)}
              </p>
              <p>
                <i className="bi bi-geo-alt me-2 text-primary" />
                <strong>Địa điểm:</strong> {job.location}
              </p>
              <p>
                <i className="bi bi-award me-2 text-warning" />
                <strong>Kinh nghiệm:</strong> {job.experience}
              </p>
              <p>
                <i className="bi bi-calendar-plus me-2" />
                <strong>Ngày đăng:</strong> {formatDate(job.createdAt)}
              </p>
              <p className="mb-0">
                <i className="bi bi-calendar-x me-2 text-danger" />
                <strong>Hạn nộp:</strong> {formatDate(job.deadline)}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Ứng tuyển: {job.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label>Họ tên *</Form.Label>
                <Form.Control name="fullName" value={form.fullName} onChange={handleChange} isInvalid={!!errors.fullName} />
                <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control name="email" value={form.email} onChange={handleChange} isInvalid={!!errors.email} />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label>Số điện thoại *</Form.Label>
                <Form.Control name="phone" value={form.phone} onChange={handleChange} isInvalid={!!errors.phone} />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md={6} className="mb-3">
                <Form.Label>Link CV (Google Drive...) *</Form.Label>
                <Form.Control
                  name="cvLink"
                  placeholder="https://..."
                  value={form.cvLink}
                  onChange={handleChange}
                  isInvalid={!!errors.cvLink}
                />
                <Form.Control.Feedback type="invalid">{errors.cvLink}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Form.Group>
              <Form.Label>Thư giới thiệu *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleChange}
                isInvalid={!!errors.coverLetter}
              />
              <Form.Control.Feedback type="invalid">{errors.coverLetter}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button type="submit">Nộp hồ sơ</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default JobDetail
