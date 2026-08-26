import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDb from './config/connect.js';
import userRoute from './routes/userRoute.js'
import postRoute from './routes/postRoute.js'
import messageRoute from './routes/messageRoute.js'

dotenv.config();

import { app, server } from './socket/socket.js';

const API_BASE_URL = process.env.API_BASE_URL;

const PORT = process.env.PORT || 8000;

// middlewares
app.use(express.json());
app.use(cookieParser())
app.use(urlencoded({ extended: true }))

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.API_BASE_URL,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (typeof origin === 'string' && origin.endsWith('.vercel.app'))) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}
app.use(cors(corsOptions));


// routes

app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/message', messageRoute);



connectDb();
server.listen(PORT, () => {
    console.log(`Server started at ${PORT}`)
})