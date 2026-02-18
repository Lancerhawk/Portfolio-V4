import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ControlProvider } from './context/ControlProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ControlProvider>
        <App />
      </ControlProvider>
    </BrowserRouter>
  </StrictMode>,
)