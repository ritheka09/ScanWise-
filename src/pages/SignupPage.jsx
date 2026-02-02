import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function SignupPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      await signup(email, password)
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
          Join ScanWise
        </h1>
        <p className="auth-subtitle">Create your account to get started</p>
        
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
            autoComplete="new-password"
          />
          
          {error && <div className="auth-error">{error}</div>}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="auth-switch">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="auth-link">
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignupPage