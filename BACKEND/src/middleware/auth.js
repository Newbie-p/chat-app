import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../utils/errorHandler.js'

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) throw new UnauthorizedError('No token provided')

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.username = decoded.username
    next()
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
}