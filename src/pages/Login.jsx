import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Card, Form, Button, Alert, Row, Col, Table } from 'react-bootstrap'
import { userApi } from '../api/services'
import { useAuth } from '../context/AuthContext'

// Trang mặc định sau khi đăng nhập theo vai trò
const HOME_BY_ROLE = { admin: '/admin', employer: '/employer/jobs', candidate: '/jobs' }

function Login() {
  const location = useLocation()
  const { user, login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [validated, setValidated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to={location.state?.from || HOME_BY_ROLE[user.role]} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)
    if (!e.currentTarget.checkValidity()) return

    setLoading(true)
    setError('')
    try {
      const users = await userApi.login(form.email.trim(), form.password)
      if (users.length === 0) setError('Email hoặc mật khẩu không đúng')
      else if (users[0].status === 'locked') setError('Tài khoản của bạn đã bị khóa')
      else login(users[0]) // lưu vào localStorage, trang tự chuyển hướng
    } catch {
      setError('Không kết nối được server, hãy chạy: npm run server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row className="justify-content-center">
      <Col md={6} lg={5}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <h3 className="text-center mb-4">Đăng nhập</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">Vui lòng nhập email hợp lệ</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">Mật khẩu tối thiểu 6 ký tự</Form.Control.Feedback>
              </Form.Group>
              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </div>
          </Card.Body>
        </Card>

        <Card className="mt-3">
          <Card.Body>
            <small className="text-muted">Tài khoản demo (mật khẩu đều là 123456):</small>
            <Table size="sm" className="mb-0 small">
              <tbody>
                <tr>
                  <td>Admin</td>
                  <td>admin@jobhub.vn</td>
                </tr>
                <tr>
                  <td>Nhà tuyển dụng</td>
                  <td>hr@fpt.vn</td>
                </tr>
                <tr>
                  <td>Ứng viên</td>
                  <td>an@gmail.com</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default Login
