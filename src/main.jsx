import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ControlProvider } from './context/ControlProvider'
import { Vyzora } from 'vyzora-sdk';

new Vyzora({
  apiKey: import.meta.env.VITE_VYZORA_KEY,
  enabled: true,
  debug: true
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ControlProvider>
        <App />
      </ControlProvider>
    </BrowserRouter>
  </StrictMode>,
)