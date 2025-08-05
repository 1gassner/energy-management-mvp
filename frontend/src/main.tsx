import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/analytics-glassmorphism.css'

// Temporarily disable StrictMode to prevent Zustand race conditions in production
// This fixes useState hook errors caused by double-execution of effects
const enableStrictMode = import.meta.env.DEV;

ReactDOM.createRoot(document.getElementById('root')!).render(
  enableStrictMode ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  ),
)