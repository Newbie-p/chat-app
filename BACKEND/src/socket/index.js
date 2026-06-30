import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import redis from "../config/redis.js";
import { messageLimiter } from "../middleware/rateLimiter.js";

export const initSocket = (io) => {
  // JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // Helper — builds member list with online status and broadcasts to everyone in the room
  const broadcastMembers = async (io, roomId) => {
    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, username: true, avatarColor: true } },
      },
    });

    const membersWithStatus = await Promise.all(
      members.map(async (m) => {
        const status = await redis.get(`chat:presence:${m.user.id}`);
        return {
          ...m.user,
          online: status === "online",
        };
      })
    );

    io.to(roomId).emit("room:members", membersWithStatus);
  };

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.username} (${socket.id})`);

    redis.set(`chat:presence:${socket.userId}`, "online").catch((err) => {
      console.error("Redis presence set failed:", err.message);
    });

    // Join Room
    socket.on("room:join", async ({ roomId }) => {
      try {
        const membership = await prisma.roomMember.findUnique({
          where: {
            roomId_userId: { roomId, userId: socket.userId },
          },
        });

        if (!membership) {
          socket.emit("error", { message: "You are not a member of this room" });
          return;
        }

        // Leave previous room if switching
        if (socket.currentRoom && socket.currentRoom !== roomId) {
          socket.leave(socket.currentRoom);
          socket.to(socket.currentRoom).emit("typing:stop", {
            userId: socket.userId,
            username: socket.username,
          });
        }

        socket.join(roomId);
        socket.currentRoom = roomId;

        // Broadcast updated member list to EVERYONE in the room (including the joiner)
        await broadcastMembers(io, roomId);

      } catch (err) {
        console.error("room:join error:", err);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Send Message
    socket.on("message:send", async ({ roomId, content }) => {
      await new Promise((resolve) => messageLimiter(socket, resolve));
      try {
        if (!content || !content.trim()) return;

        if (content.trim().length > 1000) {
          socket.emit("error", { message: "Message too long (max 1000 chars)" });
          return;
        }

        const membership = await prisma.roomMember.findUnique({
          where: {
            roomId_userId: { roomId, userId: socket.userId },
          },
        });

        if (!membership) {
          socket.emit("error", { message: "Not a member of this room" });
          return;
        }

        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            roomId,
            senderId: socket.userId,
          },
          include: {
            sender: {
              select: { id: true, username: true, avatarColor: true },
            },
          },
        });

        io.to(roomId).emit("message:new", {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender,
          roomId,
        });

      } catch (err) {
        console.error("message:send error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing Indicators — include username in both events so frontend can match/remove reliably
    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:start", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:stop", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.username}`);

      redis.del(`chat:presence:${socket.userId}`).catch((err) => {
        console.error("Redis presence del failed:", err.message);
      });

      if (socket.currentRoom) {
        // Clear any stuck typing indicator for this user
        socket.to(socket.currentRoom).emit("typing:stop", {
          userId: socket.userId,
          username: socket.username,
        });

        // Broadcast updated member list (this user now offline)
        broadcastMembers(io, socket.currentRoom).catch((err) => {
          console.error("broadcastMembers on disconnect failed:", err.message);
        });
      }
    });
  });
};