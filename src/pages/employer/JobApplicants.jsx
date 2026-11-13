import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Table, Button, Alert, Spinner, Card, Modal, ButtonGroup } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { jobApi, applicationApi } from '../../api/services'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/format'

function JobApplicants() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    Promise.all([jobApi.getById(id), applicationApi.getByJob(id)])
      .then(([jobData, appData]) => {
        setJob(jobData)
        setApplications(appData)
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false))
  }, [id])

  const changeStatus = async (app, status) => {
    const updated = await applicationApi.update(app.id, { status })
    setApplications(applications.map((a) => (a.id === app.id ? updated : a)))
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (!job || job.employerId !== user.id) return <Alert variant="danger">Không tìm thấy tin tuyển dụng.</Alert>

  return (
    <>
      <Link to="/employer/jobs">&laquo; Tin tuyển dụng của tôi</Link>
      <h3 className="mt-2">Ứng viên: {job.title}</h3>
      <p className="text-muted">{applications.length} hồ sơ ứng tuyển</p>

      {applications.length === 0 ? (
        <Alert variant="info">Chưa có ứng viên nào ứng tuyển.</Alert>
      ) : (
        <Card className="shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Họ tên</th>
                <th>Liên hệ</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td>{a.fullName}</td>
                  <td className="small">
                    {a.email}
                    <br />
                    {a.phone}
                  </td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="text-end">
                    <ButtonGroup size="sm">
                      <Button variant="outline-secondary" onClick={() => setViewing(a)}>
                        Xem hồ sơ
                      </Button>
                      <Button
                        variant="outline-success"
                        disabled={a.status === 'accepted'}
                        onClick={() => changeStatus(a, 'accepted')}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outline-danger"
                        disabled={a.status === 'rejected'}
                        onClick={() => changeStatus(a, 'rejected')}
                      >
                        Từ chối
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal show={!!viewing} onHide={() => setViewing(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Hồ sơ: {viewing?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Email:</strong> {viewing?.email}
          </p>
          <p>
            <strong>Điện thoại:</strong> {viewing?.phone}
          </p>
          <p>
            <strong>CV:</strong>{' '}
            <a href={viewing?.cvLink} target="_blank" rel="noreferrer">
              {viewing?.cvLink}
            </a>
          </p>
          <strong>Thư giới thiệu:</strong>
          <p className="pre-line border rounded p-2 bg-light mt-1">{viewing?.coverLetter}</p>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default JobApplicants
