import axiosClient from './axiosClient'

export const userApi = {
  getAll: () => axiosClient.get('/users'),
  getById: (id) => axiosClient.get(`/users/${id}`),
  findByEmail: (email) => axiosClient.get('/users', { params: { email } }),
  login: (email, password) => axiosClient.get('/users', { params: { email, password } }),
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
  // params ví dụ: { status: 'approved', employerId: 2, _sort: 'createdAt', _order: 'desc' }
  getAll: (params) => axiosClient.get('/jobs', { params }),
  getById: (id) => axiosClient.get(`/jobs/${id}`, { params: { _expand: 'category' } }),
  create: (data) => axiosClient.post('/jobs', data),
  update: (id, data) => axiosClient.patch(`/jobs/${id}`, data),
  remove: (id) => axiosClient.delete(`/jobs/${id}`),
}

export const applicationApi = {
  getAll: (params) => axiosClient.get('/applications', { params }),
  getByCandidate: (candidateId) =>
    axiosClient.get('/applications', { params: { candidateId, _expand: 'job', _sort: 'id', _order: 'desc' } }),
  getByJob: (jobId) => axiosClient.get('/applications', { params: { jobId, _sort: 'id', _order: 'desc' } }),
  create: (data) => axiosClient.post('/applications', data),
  update: (id, data) => axiosClient.patch(`/applications/${id}`, data),
  remove: (id) => axiosClient.delete(`/applications/${id}`),
}

// Việc làm đã lưu không gọi API mà lưu ở localStorage (xem context/SavedJobsContext.jsx)
