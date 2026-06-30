import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login({ email, password })
      login(data.token, data.user)
      navigate('/chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (name) => ({
    width: '100%',
    padding: '11px 14px',
    fontSize: '13px',
    fontFamily: 'Inter, system-ui, sans-serif',
    background: '#EDE8DF',
    border: `1.5px solid ${focused === name ? '#B87420' : '#CFC8BE'}`,
    borderRadius: '7px',
    outline: 'none',
    color: '#1A1510',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#EDE8DF', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav style={{ background: '#1A1510', borderBottom: '1px solid #2C2318', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span onClick={() => navigate('/')} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', color: '#EDE8DF', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em' }}>
          ChatSpace
        </span>
        <span style={{ fontSize: '13px', color: '#9B8E80' }}>
          No account?{' '}
          <span onClick={() => navigate('/register')} style={{ color: '#B87420', cursor: 'pointer', fontWeight: 500 }}>
            Get started →
          </span>
        </span>
      </nav>

      {/* Center content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#9B8E80', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
              Welcome back
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 300, color: '#1A1510', lineHeight: 1.2, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
              Sign in to{' '}
              <strong style={{ fontWeight: 600, fontStyle: 'normal' }}>ChatSpace</strong>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#7A6E62', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                required
                style={inputStyle('email')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#7A6E62', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                minLength={6}
                style={inputStyle('password')}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#FDF0EC', border: '1px solid #E8C4B0', borderRadius: '7px', fontSize: '13px', color: '#8C3A1A' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 18px',
                background: loading ? '#9B8E80' : '#1A1510',
                color: '#EDE8DF',
                border: 'none',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s ease',
              }}
            >
              {loading ? 'Signing in…' : <><span>Sign in</span><span style={{ color: '#B87420' }}>→</span></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#CFC8BE' }} />
            <span style={{ fontSize: '11px', color: '#9B8E80', fontFamily: 'JetBrains Mono, monospace' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#CFC8BE' }} />
          </div>

          {/* Register CTA */}
          <button
            onClick={() => navigate('/register')}
            style={{
              width: '100%',
              padding: '12px 18px',
              background: 'transparent',
              color: '#B87420',
              border: '1.5px solid #B87420',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <span>Create a new account</span>
            <span>→</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#9B8E80', marginTop: '24px', fontFamily: 'JetBrains Mono, monospace' }}>
            ChatSpace · real-time rooms
          </p>
        </div>
      </div>
    </div>
  )
}