import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Alert, Spinner, Card } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { applicationApi } from '../../api/services'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import { formatDate } from '../../utils/format'

function MyApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(null)

  useEffect(() => {
    applicationApi
      .getByCandidate(user.id)
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [user.id])

  const handleWithdraw = async () => {
    await applicationApi.remove(withdrawing.id)
    setApplications(applications.filter((a) => a.id !== withdrawing.id))
    setWithdrawing(null)
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <h3 className="mb-3">Việc đã ứng tuyển</h3>
      {applications.length === 0 ? (
        <Alert variant="info">
          Bạn chưa ứng tuyển công việc nào. <Link to="/jobs">Tìm việc ngay</Link>
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Vị trí</th>
                <th>Công ty</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td>{a.job ? <Link to={`/jobs/${a.jobId}`}>{a.job.title}</Link> : <em>Tin đã bị xóa</em>}</td>
                  <td>{a.job?.companyName}</td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="text-end">
                    {a.status === 'pending' && (
                      <Button size="sm" variant="outline-danger" onClick={() => setWithdrawing(a)}>
                        Rút hồ sơ
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <ConfirmModal
        show={!!withdrawing}
        title="Rút hồ sơ"
        message={`Bạn chắc chắn muốn rút hồ sơ ứng tuyển "${withdrawing?.job?.title}"?`}
        confirmText="Rút hồ sơ"
        onConfirm={handleWithdraw}
        onHide={() => setWithdrawing(null)}
      />
    </>
  )
}

export default MyApplications
