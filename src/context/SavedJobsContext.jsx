import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

// Việc làm đã lưu được giữ trong localStorage theo từng người dùng:
// { "4": [1, 3], "5": [2] }  =>  userId: danh sách jobId đã lưu
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

  const savedIds = user ? savedByUser[user.id] || [] : []

  const isSaved = (jobId) => savedIds.includes(jobId)

  // Đã lưu thì bỏ lưu, chưa lưu thì lưu
  const toggleSave = (jobId) => {
    if (!user) return
    const nextIds = isSaved(jobId) ? savedIds.filter((id) => id !== jobId) : [...savedIds, jobId]
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
