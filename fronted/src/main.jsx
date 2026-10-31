import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import axios from 'axios'

// Attach Bearer token to all outgoing requests if present in localStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const queryClient = new QueryClient()
createRoot(document.getElementById('root')).render(
  <StrictMode>

    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
    <Toaster/>
    <App />
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)