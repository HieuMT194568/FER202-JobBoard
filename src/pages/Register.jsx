import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { userApi } from '../api/services'
import { useAuth } from '../context/AuthContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^0\d{9}$/

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Họ tên tối thiểu 2 ký tự'
  if (!EMAIL_REGEX.test(form.email)) errors.email = 'Email không hợp lệ'
  if (!PHONE_REGEX.test(form.phone)) errors.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
  if (form.password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Mật khẩu nhập lại không khớp'
  if (form.role === 'employer' && !form.companyName.trim()) errors.companyName = 'Vui lòng nhập tên công ty'
  return errors
}

function Register() {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
    companyName: '',
  })
  const [errors, setErrors] = useState({})

  if (user) return <Navigate to="/" replace />

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setError('')
    try {
      const email = form.email.trim()
      const existed = await userApi.findByEmail(email)
      if (existed.length > 0) {
        setError('Email đã được sử dụng')
        return
      }
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, companyName, ...data } = form
      const newUser = await userApi.create({
        ...data,
        email,
        status: 'active',
        ...(form.role === 'employer' && { companyName: companyName.trim() }),
      })
      login(newUser) // đăng ký xong tự đăng nhập
    } catch {
      setError('Không kết nối được server, hãy chạy: npm run server')
    } finally {
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text') => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control type={type} name={name} value={form[name]} onChange={handleChange} isInvalid={!!errors[name]} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  )

  return (
    <Row className="justify-content-center">
      <Col md={7} lg={6}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <h3 className="text-center mb-4">Đăng ký tài khoản</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Bạn là</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    id="role-candidate"
                    label="Ứng viên"
                    name="role"
                    value="candidate"
                    checked={form.role === 'candidate'}
                    onChange={handleChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="role-employer"
                    label="Nhà tuyển dụng"
                    name="role"
                    value="employer"
                    checked={form.role === 'employer'}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
              {field('name', 'Họ tên')}
              {form.role === 'employer' && field('companyName', 'Tên công ty')}
              {field('email', 'Email', 'email')}
              {field('phone', 'Số điện thoại')}
              <Row>
                <Col md={6}>{field('password', 'Mật khẩu', 'password')}</Col>
                <Col md={6}>{field('confirmPassword', 'Nhập lại mật khẩu', 'password')}</Col>
              </Row>
              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default Register
