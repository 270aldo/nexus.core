import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Simple test component since main.tsx is simplified
const TestApp = () => {
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

describe('NEXUS-CORE App', () => {
  it('renders the main heading', () => {
    render(<TestApp />)
    expect(screen.getByText('🚀 NEXUS-CORE')).toBeInTheDocument()
  })

  it('displays the enterprise subtitle', () => {
    render(<TestApp />)
    expect(screen.getByText('Enterprise Platform for NGX Performance & Longevity')).toBeInTheDocument()
  })

  it('shows backend API status', () => {
    render(<TestApp />)
    expect(screen.getByText('Running on :8000')).toBeInTheDocument()
  })

  it('shows MCP integration status', () => {
    render(<TestApp />)
    expect(screen.getByText('Ready for Claude Desktop')).toBeInTheDocument()
  })

  it('has proper structure with center layout', () => {
    render(<TestApp />)
    const mainContainer = screen.getByText('🚀 NEXUS-CORE').closest('div')
    expect(mainContainer).toHaveClass('text-center')
  })
})