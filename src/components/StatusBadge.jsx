import { Badge } from 'react-bootstrap'

const STATUS = {
  pending: { bg: 'warning', text: 'dark', label: 'Chờ duyệt' },
  approved: { bg: 'success', label: 'Đã duyệt' },
  rejected: { bg: 'danger', label: 'Từ chối' },
  accepted: { bg: 'success', label: 'Đã chấp nhận' },
  active: { bg: 'success', label: 'Hoạt động' },
  locked: { bg: 'secondary', label: 'Đã khóa' },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || { bg: 'light', text: 'dark', label: status }
  return (
    <Badge bg={s.bg} text={s.text}>
      {s.label}
    </Badge>
  )
}

export default StatusBadge
