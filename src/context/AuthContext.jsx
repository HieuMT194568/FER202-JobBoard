import { createContext, useContext, useState } from 'react'

// Thông tin người dùng đăng nhập được lưu trong localStorage
const STORAGE_KEY = 'jobhub_user'

const AuthContext = createContext(null)

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  // Lưu user (không lưu mật khẩu) vào state và localStorage
  const login = (userData) => {
    // eslint-disable-next-line no-unused-vars
    const { password, ...safeUser } = userData
    setUser(safeUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

// Dùng trong component: const { user, login, logout } = useAuth()
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
