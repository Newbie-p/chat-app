import jwt from 'jsonwebtoken'
import { authMiddleware } from '../src/middleware/auth.js'

// Mock environment variable
process.env.JWT_SECRET = 'test-secret-key'

describe('authMiddleware', () => {
  let req, res, next

  beforeEach(() => {
    req = { headers: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  test('throws UnauthorizedError when no token is provided', () => {
    expect(() => authMiddleware(req, res, next)).toThrow('No token provided')
  })

  test('throws UnauthorizedError when token is invalid', () => {
    req.headers.authorization = 'Bearer invalid-token-here'
    expect(() => authMiddleware(req, res, next)).toThrow('Invalid or expired token')
  })

  test('attaches userId and username to req when token is valid', () => {
    const token = jwt.sign(
      { userId: 'test-user-id', username: 'praful' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    req.headers.authorization = `Bearer ${token}`

    authMiddleware(req, res, next)

    expect(req.userId).toBe('test-user-id')
    expect(req.username).toBe('praful')
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('rejects expired tokens', () => {
    const expiredToken = jwt.sign(
      { userId: 'test-user-id', username: 'praful' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // already expired
    )
    req.headers.authorization = `Bearer ${expiredToken}`

    expect(() => authMiddleware(req, res, next)).toThrow('Invalid or expired token')
  })
})