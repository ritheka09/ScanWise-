import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function LoginPage({ onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(email, password)
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">
          <span className="app-logo">🥑</span>
          Welcome Back
        </h1>
        <p className="auth-subtitle">Sign in to your ScanWise account</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            autoComplete="new-password"
          />
          
          {error && <div className="auth-error">{error}</div>}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="auth-switch">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="auth-link">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage