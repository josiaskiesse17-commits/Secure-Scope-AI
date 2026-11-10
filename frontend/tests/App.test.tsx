import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../src/App'

const makeFetchMock = () => vi.fn()

describe('App', () => {
  let fetchMock: ReturnType<typeof makeFetchMock>

  beforeEach(() => {
    vi.resetAllMocks()
    fetchMock = makeFetchMock()
    globalThis.fetch = fetchMock as unknown as typeof fetch
  })

  it('renders the app title', () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok', database: 'connected' }),
    })

    render(<App />)
    expect(screen.getByText('SecureScope AI')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'ok', database: 'connected' }),
          }), 100)
        )
    )

    render(<App />)
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('displays health status when loaded', async () => {
    fetchMock.mockResolvedValue({
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
    fetchMock.mockRejectedValue(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })
  })
})