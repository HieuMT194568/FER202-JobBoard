import { Outlet } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import AppNavbar from '../components/AppNavbar'

function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1 py-4">
        <Container>
          <Outlet />
        </Container>
      </main>
      <footer className="bg-dark text-white-50 text-center py-3 small">
        © 2026 JobHub - FER202 Assignment - Mai Trọng Hiếu (HE194568)
      </footer>
    </div>
  )
}

export default MainLayout
