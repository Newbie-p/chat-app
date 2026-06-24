import expess from 'express'
import { createRoom, joinRoom, getMyRooms, getRoomById } from '../controllers/room.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = expess.Router();

router.post('/create', authMiddleware, createRoom)
router.post('/join', authMiddleware, joinRoom)
router.get('/me', authMiddleware, getMyRooms)
router.get('/:roomId', authMiddleware, getRoomById)

export default router;