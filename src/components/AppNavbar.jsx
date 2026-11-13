import { Navbar, Nav, Container, NavDropdown, Button, Badge } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSavedJobs } from '../context/SavedJobsContext'
import { ROLE_LABELS } from '../utils/format'

function AppNavbar() {
  const { user, logout } = useAuth()
  const savedCount = useSavedJobs().savedIds.length
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-briefcase-fill me-2" />
          JobHub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Trang chủ
            </Nav.Link>
            <Nav.Link as={NavLink} to="/jobs">
              Việc làm
            </Nav.Link>

            {user?.role === 'candidate' && (
              <>
                <Nav.Link as={NavLink} to="/my-applications">
                  Việc đã ứng tuyển
                </Nav.Link>
                <Nav.Link as={NavLink} to="/saved-jobs">
                  Việc đã lưu <Badge bg="danger">{savedCount}</Badge>
                </Nav.Link>
              </>
            )}

            {user?.role === 'employer' && (
              <>
                <Nav.Link as={NavLink} to="/employer/jobs">
                  Tin tuyển dụng của tôi
                </Nav.Link>
                <Nav.Link as={NavLink} to="/employer/jobs/new">
                  Đăng tin
                </Nav.Link>
              </>
            )}

            {user?.role === 'admin' && (
              <NavDropdown title="Quản trị" id="admin-menu">
                <NavDropdown.Item as={Link} to="/admin">
                  Thống kê
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/jobs">
                  Duyệt tin tuyển dụng
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/users">
                  Quản lý người dùng
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/categories">
                  Quản lý ngành nghề
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          <Nav>
            {user ? (
              <NavDropdown
                align="end"
                id="user-menu"
                title={
                  <>
                    <i className="bi bi-person-circle me-1" />
                    {user.name} <small className="text-white-50">({ROLE_LABELS[user.role]})</small>
                  </>
                }
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Hồ sơ cá nhân
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" variant="outline-light" size="sm">
                  Đăng nhập
                </Button>
                <Button as={Link} to="/register" variant="warning" size="sm">
                  Đăng ký
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppNavbar
