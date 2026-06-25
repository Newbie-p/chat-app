import prisma from '../config/db.js';
import { nanoid } from 'nanoid';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errorHandler.js';

const wrapAsync = (fn) => (req, res, next) =>{
    Promise.resolve(fn(req, res, next)).catch(next);
}

export const createRoom = wrapAsync(async(req, res)=>{
    const { name } = req.body;
    const userId = req.userId;

    if(!name || !name.trim()){
        throw new BadRequestError('Room name is required');
    }

    const code = nanoid(8).toUpperCase();

    //transaction - room create + creator as first member
    const room = await prisma.$transaction(async(tx) =>{
        const newRoom = await tx.room.create({
            data: {
                name: name.trim(),
                code,
                createdBy: userId,
            }
        })

        await tx.roomMember.create({
            data: {
                roomId: newRoom.id,
                userId,
            }
        })

        return newRoom;
    })

    res.status(201).json({
        success: true,
        room: {
            id: room.id,
            name: room.name,
            code: room.code,
        }
    })
})

//join existing room by code 

export const joinRoom = wrapAsync(async(req, res)=>{
    const { code} = req.body;
    const userId = req.userId;

    if(!code || !code.trim()){
        throw new BadRequestError('Room code is required')
    }

    const room = await prisma.room.findUnique({
        where: {code: code.trim().toUpperCase()}
    })

    if(!room){
        throw new NotFoundError('Room not found - check the code');
    }

    //check already a member
    const existing = await prisma.roomMember.findUnique({
        where: {
            roomId_userId: {
                roomId: room.id,
                userId,
            }
        }
    })

    if(existing) throw new ConflictError('You are already a member of this room');

    await prisma.roomMember.create({
        data: {roomId: room.id, userId}
    })

    res.json({
        success: true,
        room:{
            id: room.id,
            name: room.name,
            code: room.code,
        }
    })
})

export const getMyRooms = wrapAsync(async (req, res) => {
  const userId = req.userId

  const memberships = await prisma.roomMember.findMany({
    where: { userId },
    include: {
      room: {
        include: {
          _count: {
            select: { members: true, messages: true }
          }
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  })

  const rooms = memberships.map(m => ({
    id: m.room.id,
    name: m.room.name,
    code: m.room.code,
    memberCount: m.room._count.members,
    messageCount: m.room._count.messages,
    joinedAt: m.joinedAt,
  }))

  res.json({ success: true, rooms })
})

// Get single room details + recent messages
export const getRoomById = wrapAsync(async (req, res) => {
  const { roomId } = req.params
  const userId = req.userId

  // Check if user is member
  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: { roomId, userId }
    }
  })

  if (!membership) throw new NotFoundError('Room not found or you are not a member')

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, avatarColor: true }
          }
        }
      },
      messages: {
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, username: true, avatarColor: true }
          }
        }
      }
    }
  })

  res.json({
    success: true,
    room: {
      id: room.id,
      name: room.name,
      code: room.code,
      members: room.members.map(m => m.user),
      messages: room.messages.reverse(), // oldest first
    }
  })
})

export const getMessages = wrapAsync(async(req, res)=>{
  const { roomId } = req.params
  const { cursor, limit = 50} = req.query
  const userId = req.userId

  //check membership
  const membership = await prisma.roomMember.findUnique({
    where: { roomId_userId: {roomId, userId}}
  })

  if(!membership){
    throw new NotFoundError('Room not found or you re not a member')
  }

  const take = Math.min(parseInt(limit), 100) // max 100 messages at a time

  const messages = await prisma.message.findMany({
    where:{
      roomId,
      ...(cursor && {
        createdAt: { lt: new Date(cursor)}
      })
    },
    take,
    orderBy: {createdAt: 'desc'},
    include:{
      sender:{
        select: {id: true, username: true, avatarColor: true}
      }
    }
  })

  const ordered = messages.reverse()

  const nextCursor = messages.length === take
    ? messages[messages.length - 1].createdAt.toISOString()
    : null
  
  res.json({
    success: true,
    messages: ordered,
    nextCursor,
    hasMore: messages.length === take,
  })
})