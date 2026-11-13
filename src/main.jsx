import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SavedJobsProvider } from './context/SavedJobsContext'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SavedJobsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SavedJobsProvider>
    </AuthProvider>
  </StrictMode>,
)
