import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errorHandler.js'

const signToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Wrap async errors
const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const register = wrapAsync(async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    throw new BadRequestError('Username, email and password are required')
  }

  if (password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters')
  }

  // Check existing user
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  })

  if (existing) {
    throw new ConflictError(
      existing.email === email ? 'Email already registered' : 'Username already taken'
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  // Random avatar color from a set
  const colors = ['#E8743B', '#6C5CE7', '#00D9A3', '#FF6B5E', '#0984e3', '#fdcb6e']
  const avatarColor = colors[Math.floor(Math.random() * colors.length)]

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, avatarColor }
  })

  const token = signToken(user.id, user.username)

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarColor: user.avatarColor,
    }
  })
})

export const login = wrapAsync(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Email and password are required')
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) throw new UnauthorizedError('Invalid email or password')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new UnauthorizedError('Invalid email or password')

  const token = signToken(user.id, user.username)

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarColor: user.avatarColor,
    }
  })
})

export const getMe = wrapAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true, avatarColor: true }
  })

  res.json({ success: true, user })
})