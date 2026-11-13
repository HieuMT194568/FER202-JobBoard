import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { jobApi, categoryApi, sameId } from '../../api/services'
import { JOB_TYPES, LOCATIONS, EXPERIENCES, today } from '../../utils/format'

const EMPTY_JOB = {
  title: '',
  categoryId: '',
  location: '',
  type: 'Full-time',
  experience: 'Không yêu cầu',
  salaryMin: '',
  salaryMax: '',
  deadline: '',
  description: '',
  requirements: '',
  benefits: '',
}

function validate(form) {
  const errors = {}
  if (form.title.trim().length < 5) errors.title = 'Tiêu đề tối thiểu 5 ký tự'
  if (!form.categoryId) errors.categoryId = 'Vui lòng chọn ngành nghề'
  if (!form.location) errors.location = 'Vui lòng chọn địa điểm'
  const min = Number(form.salaryMin)
  const max = Number(form.salaryMax)
  if (!form.salaryMin || min <= 0) errors.salaryMin = 'Lương tối thiểu phải lớn hơn 0'
  if (!form.salaryMax || max < min) errors.salaryMax = 'Lương tối đa phải ≥ lương tối thiểu'
  if (!form.deadline || form.deadline < today()) errors.deadline = 'Hạn nộp phải từ hôm nay trở đi'
  if (form.description.trim().length < 20) errors.description = 'Mô tả tối thiểu 20 ký tự'
  if (!form.requirements.trim()) errors.requirements = 'Vui lòng nhập yêu cầu'
  return errors
}

function JobForm() {
  const { id } = useParams() // có id => đang sửa, không có => tạo mới
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState(EMPTY_JOB)
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [notAllowed, setNotAllowed] = useState(false)

  useEffect(() => {
    categoryApi.getAll().then(setCategories)
    if (isEdit) {
      jobApi
        .getById(id)
        .then((job) => {
          if (!sameId(job.employerId, user.id)) return setNotAllowed(true)
          // eslint-disable-next-line no-unused-vars
          const { category, ...rest } = job
          setForm(rest)
        })
        .catch(() => setNotAllowed(true))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit, user.id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const data = {
      ...form,
      title: form.title.trim(),
      // giữ đúng kiểu id của category (số với json-server 0.17, chuỗi với 1.0)
      categoryId: categories.find((c) => sameId(c.id, form.categoryId)).id,
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      status: 'pending', // tin mới hoặc vừa sửa đều phải chờ admin duyệt lại
    }
    if (isEdit) {
      await jobApi.update(id, data)
    } else {
      await jobApi.create({ ...data, employerId: user.id, companyName: user.companyName, createdAt: today() })
    }
    navigate('/employer/jobs')
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (notAllowed) return <Alert variant="danger">Bạn không có quyền sửa tin này.</Alert>

  const text = (name, label, props = {}) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control name={name} value={form[name]} onChange={handleChange} isInvalid={!!errors[name]} {...props} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  )

  const select = (name, label, options) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Select name={name} value={form[name]} onChange={handleChange} isInvalid={!!errors[name]}>
        <option value="">-- Chọn --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  )

  const toOptions = (arr) => arr.map((x) => ({ value: x, label: x }))

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <h3 className="mb-3">{isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}</h3>
        <Alert variant="info" className="small">
          Tin sau khi đăng hoặc chỉnh sửa sẽ ở trạng thái <strong>Chờ duyệt</strong> cho tới khi quản trị viên phê duyệt.
        </Alert>
        <Form noValidate onSubmit={handleSubmit}>
          {text('title', 'Tiêu đề công việc *')}
          <Row>
            <Col md={4}>
              {select(
                'categoryId',
                'Ngành nghề *',
                categories.map((c) => ({ value: c.id, label: c.name })),
              )}
            </Col>
            <Col md={4}>{select('location', 'Địa điểm *', toOptions(LOCATIONS))}</Col>
            <Col md={4}>{select('type', 'Hình thức *', toOptions(JOB_TYPES))}</Col>
          </Row>
          <Row>
            <Col md={3}>{text('salaryMin', 'Lương từ (triệu) *', { type: 'number', min: 0 })}</Col>
            <Col md={3}>{text('salaryMax', 'Lương đến (triệu) *', { type: 'number', min: 0 })}</Col>
            <Col md={3}>{select('experience', 'Kinh nghiệm', toOptions(EXPERIENCES))}</Col>
            <Col md={3}>{text('deadline', 'Hạn nộp hồ sơ *', { type: 'date' })}</Col>
          </Row>
          {text('description', 'Mô tả công việc *', { as: 'textarea', rows: 4 })}
          {text('requirements', 'Yêu cầu ứng viên *', { as: 'textarea', rows: 3 })}
          {text('benefits', 'Quyền lợi', { as: 'textarea', rows: 3 })}
          <div className="d-flex gap-2">
            <Button type="submit">{isEdit ? 'Lưu thay đổi' : 'Đăng tin'}</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Hủy
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default JobForm
