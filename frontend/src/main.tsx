import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Simple Hello World for testing build
const App = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          🚀 NEXUS-CORE
        </h1>
        <p className="text-muted-foreground">
          Enterprise Platform for NGX Performance & Longevity
        </p>
        <div className="mt-8 p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Backend API: <span className="text-green-600">Running on :8000</span>
          </p>
          <p className="text-sm text-muted-foreground">
            MCP Integration: <span className="text-blue-600">Ready for Claude Desktop</span>
          </p>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)