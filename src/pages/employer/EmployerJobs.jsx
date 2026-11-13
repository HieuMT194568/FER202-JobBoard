import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Alert, Spinner, Card, ButtonGroup } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { jobApi, applicationApi, sameId } from '../../api/services'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import { formatDate, formatSalary, isExpired } from '../../utils/format'

function EmployerJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    Promise.all([jobApi.getAll({ employerId: user.id }), applicationApi.getAll()])
      .then(([jobData, appData]) => {
        setJobs(jobData)
        setApplications(appData)
      })
      .finally(() => setLoading(false))
  }, [user.id])

  const countApplicants = (jobId) => applications.filter((a) => sameId(a.jobId, jobId)).length

  const handleDelete = async () => {
    // jobApi.remove xóa luôn các hồ sơ ứng tuyển của tin này
    await jobApi.remove(deleting.id)
    setJobs(jobs.filter((j) => j.id !== deleting.id))
    setDeleting(null)
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Tin tuyển dụng của tôi</h3>
        <Button as={Link} to="/employer/jobs/new">
          <i className="bi bi-plus-lg me-1" /> Đăng tin mới
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Alert variant="info">Bạn chưa đăng tin tuyển dụng nào.</Alert>
      ) : (
        <Card className="shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Vị trí</th>
                <th>Lương</th>
                <th>Hạn nộp</th>
                <th>Trạng thái</th>
                <th className="text-center">Ứng viên</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    <div className="small text-muted">
                      {job.location} · {job.type}
                    </div>
                  </td>
                  <td>{formatSalary(job.salaryMin, job.salaryMax)}</td>
                  <td className={isExpired(job.deadline) ? 'text-danger' : ''}>{formatDate(job.deadline)}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="text-center">{countApplicants(job.id)}</td>
                  <td className="text-end">
                    <ButtonGroup size="sm">
                      <Button as={Link} to={`/employer/jobs/${job.id}/applicants`} variant="outline-primary">
                        <i className="bi bi-people" /> Ứng viên
                      </Button>
                      <Button as={Link} to={`/employer/jobs/${job.id}/edit`} variant="outline-secondary">
                        <i className="bi bi-pencil" /> Sửa
                      </Button>
                      <Button variant="outline-danger" onClick={() => setDeleting(job)}>
                        <i className="bi bi-trash" /> Xóa
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
        message={`Xóa tin "${deleting?.title}"? Toàn bộ hồ sơ ứng tuyển của tin này cũng sẽ bị xóa.`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}

export default EmployerJobs
