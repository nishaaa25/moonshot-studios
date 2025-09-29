import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { initEnhancedViewportHeight } from './utils/viewport'
import './index.css'

// Initialize enhanced viewport height utility
// This sets initial --vh value before React mounts
initEnhancedViewportHeight()

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
)
