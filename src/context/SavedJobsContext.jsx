import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

// Việc làm đã lưu được giữ trong localStorage theo từng người dùng:
// { "4": ["1", "3"], "5": ["2"] }  =>  userId: danh sách jobId đã lưu
const STORAGE_KEY = 'jobhub_saved_jobs'

const SavedJobsContext = createContext(null)

const loadSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function SavedJobsProvider({ children }) {
  const { user } = useAuth()
  const [savedByUser, setSavedByUser] = useState(loadSaved)

  // Id lưu dạng chuỗi để dùng được với cả json-server 0.17 (id số) và 1.0 (id chuỗi)
  const savedIds = user ? (savedByUser[user.id] || []).map(String) : []

  const isSaved = (jobId) => savedIds.includes(String(jobId))

  // Đã lưu thì bỏ lưu, chưa lưu thì lưu
  const toggleSave = (jobId) => {
    if (!user) return
    const key = String(jobId)
    const nextIds = isSaved(key) ? savedIds.filter((id) => id !== key) : [...savedIds, key]
    const next = { ...savedByUser, [user.id]: nextIds }
    setSavedByUser(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <SavedJobsContext.Provider value={{ savedIds, isSaved, toggleSave }}>{children}</SavedJobsContext.Provider>
  )
}

// Dùng trong component: const { savedIds, isSaved, toggleSave } = useSavedJobs()
// eslint-disable-next-line react-refresh/only-export-components
export const useSavedJobs = () => useContext(SavedJobsContext)
