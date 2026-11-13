import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Card, Spinner, Table, ProgressBar } from 'react-bootstrap'
import { userApi, jobApi, applicationApi, categoryApi, sameId } from '../../api/services'

function StatCard({ icon, label, value, color, to }) {
  return (
    <Card as={to ? Link : 'div'} to={to} className={`shadow-sm stat-card text-decoration-none border-${color} border-start border-4`}>
      <Card.Body className="d-flex align-items-center gap-3">
        <i className={`bi ${icon} fs-1 text-${color}`} />
        <div>
          <div className="display-6 text-body">{value}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </Card.Body>
    </Card>
  )
}

function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([userApi.getAll(), jobApi.getAll(), applicationApi.getAll(), categoryApi.getAll()]).then(
      ([users, jobs, applications, categories]) => setData({ users, jobs, applications, categories }),
    )
  }, [])

  if (!data)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  const { users, jobs, applications, categories } = data
  const count = (arr, key, value) => arr.filter((x) => x[key] === value).length
  const approvedJobs = jobs.filter((j) => j.status === 'approved')

  return (
    <>
      <h3 className="mb-4">Bảng điều khiển quản trị</h3>
      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <StatCard icon="bi-people" label="Ứng viên" value={count(users, 'role', 'candidate')} color="primary" to="/admin/users" />
        </Col>
        <Col md={6} lg={3}>
          <StatCard icon="bi-building" label="Nhà tuyển dụng" value={count(users, 'role', 'employer')} color="info" to="/admin/users" />
        </Col>
        <Col md={6} lg={3}>
          <StatCard icon="bi-briefcase" label="Tin đã duyệt" value={approvedJobs.length} color="success" to="/admin/jobs" />
        </Col>
        <Col md={6} lg={3}>
          <StatCard icon="bi-hourglass-split" label="Tin chờ duyệt" value={count(jobs, 'status', 'pending')} color="warning" to="/admin/jobs" />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold">Số tin tuyển dụng theo ngành nghề</Card.Header>
            <Card.Body>
              {categories.map((c) => {
                const n = jobs.filter((j) => sameId(j.categoryId, c.id)).length
                return (
                  <div key={c.id} className="mb-3">
                    <div className="d-flex justify-content-between small">
                      <span>{c.name}</span>
                      <span>{n} tin</span>
                    </div>
                    <ProgressBar now={jobs.length ? (n / jobs.length) * 100 : 0} />
                  </div>
                )
              })}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold">Hồ sơ ứng tuyển ({applications.length})</Card.Header>
            <Card.Body>
              <Table size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td>Chờ duyệt</td>
                    <td className="text-end fw-semibold">{count(applications, 'status', 'pending')}</td>
                  </tr>
                  <tr>
                    <td>Đã chấp nhận</td>
                    <td className="text-end fw-semibold text-success">{count(applications, 'status', 'accepted')}</td>
                  </tr>
                  <tr>
                    <td>Từ chối</td>
                    <td className="text-end fw-semibold text-danger">{count(applications, 'status', 'rejected')}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AdminDashboard
