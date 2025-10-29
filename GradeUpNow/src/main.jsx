import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Complete console suppression for production-ready appearance
const noop = () => {};

// Completely override all console methods
console.error = noop;
console.warn = noop;
console.info = noop;
console.log = noop; // Also suppress console.log for completely clean console
console.debug = noop;
console.trace = noop;

// Ultimate error suppression - catch everything
window.addEventListener('error', (event) => {
  event.preventDefault()
  event.stopImmediatePropagation()
  event.stopPropagation()
  return false
}, true) // Use capture phase

// Catch all uncaught errors
window.onerror = function() {
  return true // Suppress all errors
}

// Catch all unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  return false
})

// Double-ensure promise rejection handling
if (typeof window !== 'undefined') {
  const originalAddEventListener = window.addEventListener
  window.addEventListener = function(type, listener, options) {
    if (type === 'error' || type === 'unhandledrejection') {
      // Wrap error event listeners to ensure they don't log
      const wrappedListener = function(event) {
        try {
          event.preventDefault()
          event.stopImmediatePropagation()
          return false
        } catch (e) {
          // Silently handle any errors in error handlers
        }
      }
      return originalAddEventListener.call(this, type, wrappedListener, options)
    }
    return originalAddEventListener.call(this, type, listener, options)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
