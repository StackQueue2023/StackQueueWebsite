import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initUIErrorMonitoring } from './services/uiErrorMonitoringService'

// Initialize real-time UI loading failure and runtime error monitoring
initUIErrorMonitoring();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
