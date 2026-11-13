import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import JobList from './pages/JobList'
import JobDetail from './pages/JobDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

import MyApplications from './pages/candidate/MyApplications'
import SavedJobs from './pages/candidate/SavedJobs'

import EmployerJobs from './pages/employer/EmployerJobs'
import JobForm from './pages/employer/JobForm'
import JobApplicants from './pages/employer/JobApplicants'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageJobs from './pages/admin/ManageJobs'
import ManageUsers from './pages/admin/ManageUsers'
import ManageCategories from './pages/admin/ManageCategories'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Trang công khai */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Cần đăng nhập (mọi vai trò) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Ứng viên */}
        <Route element={<ProtectedRoute roles={['candidate']} />}>
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
        </Route>

        {/* Nhà tuyển dụng */}
        <Route element={<ProtectedRoute roles={['employer']} />}>
          <Route path="/employer/jobs" element={<EmployerJobs />} />
          <Route path="/employer/jobs/new" element={<JobForm />} />
          <Route path="/employer/jobs/:id/edit" element={<JobForm />} />
          <Route path="/employer/jobs/:id/applicants" element={<JobApplicants />} />
        </Route>

        {/* Quản trị viên */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<ManageJobs />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
        </Route>

        <Route path="/forbidden" element={<NotFound forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
