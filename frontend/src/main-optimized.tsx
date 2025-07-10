import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { optimizedRouter } from './app/router/optimized-router'
import { PerformanceProvider } from './shared/providers/PerformanceProvider'
import './index.css'

// Performance-optimized initialization
const startTime = performance.now();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PerformanceProvider>
      <RouterProvider router={optimizedRouter} />
    </PerformanceProvider>
  </React.StrictMode>,
)

// Log initialization time
console.log(`⚡ NEXUS-CORE initialized in ${(performance.now() - startTime).toFixed(2)}ms`)