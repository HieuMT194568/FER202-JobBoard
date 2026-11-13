import axiosClient from './axiosClient'

// LƯU Ý: code này chạy được với cả json-server 0.17.x và 1.0 (beta).
// - Bản 1.0 trả id dạng chuỗi ("1") nên luôn so sánh id bằng sameId()
// - Bản 1.0 không hỗ trợ _expand, _sort/_order như bản 0.17 nên việc lọc,
//   sắp xếp và nối dữ liệu (job + category, application + job) làm ở phía React

export const sameId = (a, b) => String(a) === String(b)

// Mới nhất lên đầu (theo ngày tạo, cùng ngày thì id lớn hơn lên trước)
export const sortNewest = (list) =>
  [...list].sort(
    (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || String(b.id).localeCompare(String(a.id), undefined, { numeric: true }),
  )

export const userApi = {
  getAll: () => axiosClient.get('/users'),
  getById: (id) => axiosClient.get(`/users/${id}`),
  findByEmail: (email) => axiosClient.get('/users', { params: { email } }),
  // Lọc theo email rồi so mật khẩu ở phía React (json-server 1.0 coi "123456" là số nên lọc theo password bị sai)
  login: async (email, password) => {
    const users = await axiosClient.get('/users', { params: { email } })
    return users.filter((u) => String(u.password) === password)
  },
  create: (data) => axiosClient.post('/users', data),
  update: (id, data) => axiosClient.patch(`/users/${id}`, data),
  remove: (id) => axiosClient.delete(`/users/${id}`),
}

export const categoryApi = {
  getAll: () => axiosClient.get('/categories'),
  create: (data) => axiosClient.post('/categories', data),
  update: (id, data) => axiosClient.put(`/categories/${id}`, data),
  remove: (id) => axiosClient.delete(`/categories/${id}`),
}

export const jobApi = {
  // Lấy tất cả job, mới nhất lên đầu. filter (tùy chọn): { status, employerId }
  getAll: async (filter = {}) => {
    const jobs = await axiosClient.get('/jobs')
    return sortNewest(
      jobs.filter(
        (j) =>
          (!filter.status || j.status === filter.status) &&
          (filter.employerId === undefined || sameId(j.employerId, filter.employerId)),
      ),
    )
  },
  // Lấy 1 job kèm thông tin ngành nghề (job.category)
  getById: async (id) => {
    const [job, categories] = await Promise.all([axiosClient.get(`/jobs/${id}`), axiosClient.get('/categories')])
    return { ...job, category: categories.find((c) => sameId(c.id, job.categoryId)) }
  },
  create: (data) => axiosClient.post('/jobs', data),
  update: (id, data) => axiosClient.patch(`/jobs/${id}`, data),
  // Xóa job và toàn bộ hồ sơ ứng tuyển của job đó
  remove: async (id) => {
    const apps = await axiosClient.get('/applications')
    await Promise.all(apps.filter((a) => sameId(a.jobId, id)).map((a) => axiosClient.delete(`/applications/${a.id}`)))
    return axiosClient.delete(`/jobs/${id}`)
  },
}

export const applicationApi = {
  getAll: () => axiosClient.get('/applications'),
  // Hồ sơ của 1 ứng viên, kèm thông tin job (application.job)
  getByCandidate: async (candidateId) => {
    const [apps, jobs] = await Promise.all([axiosClient.get('/applications'), axiosClient.get('/jobs')])
    return sortNewest(
      apps
        .filter((a) => sameId(a.candidateId, candidateId))
        .map((a) => ({ ...a, job: jobs.find((j) => sameId(j.id, a.jobId)) })),
    )
  },
  // Hồ sơ ứng tuyển vào 1 job
  getByJob: async (jobId) => {
    const apps = await axiosClient.get('/applications')
    return sortNewest(apps.filter((a) => sameId(a.jobId, jobId)))
  },
  // Hồ sơ của ứng viên cho 1 job cụ thể (null nếu chưa ứng tuyển)
  findOne: async (jobId, candidateId) => {
    const apps = await axiosClient.get('/applications')
    return apps.find((a) => sameId(a.jobId, jobId) && sameId(a.candidateId, candidateId)) || null
  },
  create: (data) => axiosClient.post('/applications', data),
  update: (id, data) => axiosClient.patch(`/applications/${id}`, data),
  remove: (id) => axiosClient.delete(`/applications/${id}`),
}

// Việc làm đã lưu không gọi API mà lưu ở localStorage (xem context/SavedJobsContext.jsx)
