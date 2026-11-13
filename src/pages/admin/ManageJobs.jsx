import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Spinner, Card, Nav, ButtonGroup, Alert } from 'react-bootstrap'
import { jobApi } from '../../api/services'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import { formatDate } from '../../utils/format'

const TABS = [
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Từ chối' },
  { key: 'all', label: 'Tất cả' },
]

function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    jobApi
      .getAll({ _sort: 'id', _order: 'desc' })
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [])

  const changeStatus = async (job, status) => {
    const updated = await jobApi.update(job.id, { status })
    setJobs(jobs.map((j) => (j.id === job.id ? updated : j)))
  }

  const handleDelete = async () => {
    await jobApi.remove(deleting.id)
    setJobs(jobs.filter((j) => j.id !== deleting.id))
    setDeleting(null)
  }

  const shown = tab === 'all' ? jobs : jobs.filter((j) => j.status === tab)

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <h3 className="mb-3">Duyệt tin tuyển dụng</h3>
      <Nav variant="tabs" activeKey={tab} onSelect={setTab} className="mb-3">
        {TABS.map((t) => (
          <Nav.Item key={t.key}>
            <Nav.Link eventKey={t.key}>
              {t.label} ({t.key === 'all' ? jobs.length : jobs.filter((j) => j.status === t.key).length})
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {shown.length === 0 ? (
        <Alert variant="info">Không có tin nào.</Alert>
      ) : (
        <Card className="shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Vị trí</th>
                <th>Công ty</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                  </td>
                  <td>{job.companyName}</td>
                  <td>{formatDate(job.createdAt)}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="text-end">
                    <ButtonGroup size="sm">
                      <Button
                        variant="outline-success"
                        disabled={job.status === 'approved'}
                        onClick={() => changeStatus(job, 'approved')}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="outline-warning"
                        disabled={job.status === 'rejected'}
                        onClick={() => changeStatus(job, 'rejected')}
                      >
                        Từ chối
                      </Button>
                      <Button variant="outline-danger" onClick={() => setDeleting(job)}>
                        Xóa
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <ConfirmModal
        show={!!deleting}
        message={`Xóa tin "${deleting?.title}"?`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}

export default ManageJobs
