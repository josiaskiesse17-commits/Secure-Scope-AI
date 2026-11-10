import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  database: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/health/ready')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = (await response.json()) as HealthResponse
        setHealth(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    void fetchHealth()
  }, [])

  const renderHealthContent = () => {
    if (loading) {
      return <p className="text-gray-600">Checking...</p>
    }
    if (error) {
      return <p className="text-red-600">Error: {error}</p>
    }
    if (health) {
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={health.status === 'ok' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {health.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Database:</span>
            <span className={health.database === 'connected' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {health.database}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">SecureScope AI</h1>
        <p className="text-gray-600 mb-6 text-center">
          Local development foundation - Milestone 1
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">Backend Health Check</h2>
            {renderHealthContent()}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">Endpoints</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /health/live</code> - Process liveness</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /health/ready</code> - Readiness (DB check)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App