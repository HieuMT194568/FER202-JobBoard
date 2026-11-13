export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Remote']
export const LOCATIONS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Remote']
export const EXPERIENCES = ['Không yêu cầu', 'Dưới 1 năm', '1-2 năm', '2-3 năm', '3-5 năm', 'Trên 5 năm']

export const ROLE_LABELS = { admin: 'Quản trị viên', employer: 'Nhà tuyển dụng', candidate: 'Ứng viên' }

// Lương lưu theo đơn vị triệu VNĐ
export const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận'
  if (min && max) return `${min} - ${max} triệu`
  return min ? `Từ ${min} triệu` : `Đến ${max} triệu`
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export const today = () => new Date().toISOString().slice(0, 10)

export const isExpired = (deadline) => Boolean(deadline) && deadline < today()
