import axios from 'axios'

// Địa chỉ JSON Server (chạy bằng lệnh: npm run server)
const axiosClient = axios.create({
  baseURL: 'http://localhost:9999',
  headers: { 'Content-Type': 'application/json' },
})

// Trả thẳng response.data để component dùng cho gọn
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)

export default axiosClient
