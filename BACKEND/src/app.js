import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io'
import cors from 'cors';
import { errorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/auth.route.js';
import roomRoutes from './routes/room.route.js';
import { initSocket } from './socket/index.js'
import redis from './config/redis.js';

const app = express();
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    }
})

const PORT = process.env.PORT||3000;

app.use(express.json())
app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve test file statically
app.use(express.static(path.join(__dirname, '../')))

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
initSocket(io); // socket.io initialize

app.use(errorHandler)

httpServer.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})