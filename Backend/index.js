import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDb from './config/connect.js';
import userRoute from './routes/userRoute.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// middlewares
app.use(express.json());
app.use(cookieParser())
app.use(urlencoded({ extended: true }))

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}
app.use(cors());


// routes

app.use('/api/v1/user', userRoute);



connectDb();
app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`)
})