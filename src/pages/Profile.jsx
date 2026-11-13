import { useState } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { userApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../utils/format'

function Profile() {
  const { user, login } = useAuth()
  const [info, setInfo] = useState({ name: user.name, phone: user.phone || '', companyName: user.companyName || '' })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [infoMsg, setInfoMsg] = useState(null)
  const [pwMsg, setPwMsg] = useState(null)

  const saveInfo = async (e) => {
    e.preventDefault()
    if (info.name.trim().length < 2) return setInfoMsg({ type: 'danger', text: 'Họ tên tối thiểu 2 ký tự' })
    if (!/^0\d{9}$/.test(info.phone)) return setInfoMsg({ type: 'danger', text: 'Số điện thoại không hợp lệ' })
    const data = { name: info.name.trim(), phone: info.phone }
    if (user.role === 'employer') data.companyName = info.companyName.trim()
    const updated = await userApi.update(user.id, data)
    login(updated) // cập nhật lại thông tin trong localStorage
    setInfoMsg({ type: 'success', text: 'Cập nhật thông tin thành công' })
  }

  const changePassword = async (e) => {
    e.preventDefault()
    const dbUser = await userApi.getById(user.id)
    if (dbUser.password !== pw.current) return setPwMsg({ type: 'danger', text: 'Mật khẩu hiện tại không đúng' })
    if (pw.next.length < 6) return setPwMsg({ type: 'danger', text: 'Mật khẩu mới tối thiểu 6 ký tự' })
    if (pw.next !== pw.confirm) return setPwMsg({ type: 'danger', text: 'Mật khẩu nhập lại không khớp' })
    await userApi.update(user.id, { password: pw.next })
    setPw({ current: '', next: '', confirm: '' })
    setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công' })
  }

  return (
    <Row className="g-4">
      <Col lg={6}>
        <Card className="shadow-sm">
          <Card.Header className="fw-semibold">Thông tin cá nhân</Card.Header>
          <Card.Body>
            {infoMsg && <Alert variant={infoMsg.type}>{infoMsg.text}</Alert>}
            <Form onSubmit={saveInfo}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control value={user.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Vai trò</Form.Label>
                <Form.Control value={ROLE_LABELS[user.role]} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
              </Form.Group>
              {user.role === 'employer' && (
                <Form.Group className="mb-3">
                  <Form.Label>Tên công ty</Form.Label>
                  <Form.Control
                    value={info.companyName}
                    onChange={(e) => setInfo({ ...info, companyName: e.target.value })}
                  />
                </Form.Group>
              )}
              <Button type="submit">Lưu thay đổi</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={6}>
        <Card className="shadow-sm">
          <Card.Header className="fw-semibold">Đổi mật khẩu</Card.Header>
          <Card.Body>
            {pwMsg && <Alert variant={pwMsg.type}>{pwMsg.text}</Alert>}
            <Form onSubmit={changePassword}>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu hiện tại</Form.Label>
                <Form.Control
                  type="password"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                />
              </Form.Group>
              <Button type="submit" variant="warning">
                Đổi mật khẩu
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default Profile
