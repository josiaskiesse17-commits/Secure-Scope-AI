import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

// Mock fetch globally
global.fetch = vi.fn()

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the app title', () => {
    ;(fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok', database: 'connected' }),
    })

    render(<App />)
    expect(screen.getByText('SecureScope AI')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    ;(fetch as vi.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok', database: 'connected' }),
      }), 100))
    )

    render(<App />)
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('displays health status when loaded', async () => {
    ;(fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok', database: 'connected' }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Status:')).toBeInTheDocument()
      expect(screen.getByText('ok')).toBeInTheDocument()
      expect(screen.getByText('Database:')).toBeInTheDocument()
      expect(screen.getByText('connected')).toBeInTheDocument()
    })
  })

  it('displays error when fetch fails', async () => {
    ;(fetch as vi.Mock).mockRejectedValue(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })
  })
})