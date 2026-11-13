import { useEffect, useState } from 'react'
import { Table, Button, Spinner, Card, Form, Row, Col, Modal, Alert, ButtonGroup } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { userApi } from '../../api/services'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import { ROLE_LABELS } from '../../utils/format'

const EMPTY_USER = { name: '', email: '', phone: '', password: '', role: 'candidate', companyName: '' }

function validate(form, users, isEdit) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Họ tên tối thiểu 2 ký tự'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email không hợp lệ'
  else if (users.some((u) => u.id !== form.id && u.email === form.email.trim())) errors.email = 'Email đã tồn tại'
  if (!/^0\d{9}$/.test(form.phone)) errors.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
  if (!isEdit && form.password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự'
  if (form.role === 'employer' && !form.companyName?.trim()) errors.companyName = 'Vui lòng nhập tên công ty'
  return errors
}

function ManageUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_USER)
  const [errors, setErrors] = useState({})
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    userApi
      .getAll()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  const isEdit = Boolean(form.id)

  const openCreate = () => {
    setForm(EMPTY_USER)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (u) => {
    // eslint-disable-next-line no-unused-vars
    const { password, ...rest } = u
    setForm({ ...EMPTY_USER, ...rest, password: '' })
    setErrors({})
    setShowModal(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form, users, isEdit)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone,
      role: form.role,
      companyName: form.role === 'employer' ? form.companyName.trim() : '',
    }
    if (form.password) data.password = form.password

    if (isEdit) {
      const updated = await userApi.update(form.id, data)
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)))
    } else {
      const created = await userApi.create({ ...data, status: 'active' })
      setUsers([...users, created])
    }
    setShowModal(false)
  }

  const toggleLock = async (u) => {
    const updated = await userApi.update(u.id, { status: u.status === 'locked' ? 'active' : 'locked' })
    setUsers(users.map((x) => (x.id === u.id ? updated : x)))
  }

  const handleDelete = async () => {
    await userApi.remove(deleting.id)
    setUsers(users.filter((u) => u.id !== deleting.id))
    setDeleting(null)
  }

  const kw = search.toLowerCase()
  const shown = users.filter(
    (u) =>
      (!roleFilter || u.role === roleFilter) &&
      (!kw || u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw)),
  )

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Quản lý người dùng</h3>
        <Button onClick={openCreate}>
          <i className="bi bi-person-plus me-1" /> Thêm người dùng
        </Button>
      </div>

      <Row className="g-2 mb-3">
        <Col md={6}>
          <Form.Control placeholder="Tìm theo tên hoặc email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tất cả vai trò</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {u.name}
                  {u.companyName && <div className="small text-muted">{u.companyName}</div>}
                </td>
                <td>{u.email}</td>
                <td>{ROLE_LABELS[u.role]}</td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
                <td className="text-end">
                  <ButtonGroup size="sm">
                    <Button variant="outline-secondary" onClick={() => openEdit(u)}>
                      Sửa
                    </Button>
                    {u.id !== currentUser.id && (
                      <>
                        <Button variant="outline-warning" onClick={() => toggleLock(u)}>
                          {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                        </Button>
                        <Button variant="outline-danger" onClick={() => setDeleting(u)}>
                          Xóa
                        </Button>
                      </>
                    )}
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      {shown.length === 0 && <Alert variant="info" className="mt-3">Không tìm thấy người dùng.</Alert>}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {[
              ['name', 'Họ tên'],
              ['email', 'Email'],
              ['phone', 'Số điện thoại'],
            ].map(([name, label]) => (
              <Form.Group key={name} className="mb-3">
                <Form.Label>{label}</Form.Label>
                <Form.Control name={name} value={form[name]} onChange={handleChange} isInvalid={!!errors[name]} />
                <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>{isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select name="role" value={form.role} onChange={handleChange} disabled={form.id === currentUser.id}>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {form.role === 'employer' && (
              <Form.Group className="mb-3">
                <Form.Label>Tên công ty</Form.Label>
                <Form.Control
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  isInvalid={!!errors.companyName}
                />
                <Form.Control.Feedback type="invalid">{errors.companyName}</Form.Control.Feedback>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={!!deleting}
        message={`Xóa người dùng "${deleting?.name}"?`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}

export default ManageUsers
