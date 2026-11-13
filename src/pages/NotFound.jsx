import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'

function NotFound({ forbidden }) {
  return (
    <div className="text-center py-5">
      <h1 className="display-1 fw-bold text-secondary">{forbidden ? 403 : 404}</h1>
      <p className="lead">{forbidden ? 'Bạn không có quyền truy cập trang này.' : 'Trang bạn tìm không tồn tại.'}</p>
      <Button as={Link} to="/">
        Về trang chủ
      </Button>
    </div>
  )
}

export default NotFound
