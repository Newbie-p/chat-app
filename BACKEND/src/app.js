import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { errorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/auth.route.js';
import redis from './config/redis.js';

const app = express();
const PORT = process.env.PORT||3000;

app.use(express.json())
app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))

app.use('/api/auth', authRoutes);

app.use(errorHandler)

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})