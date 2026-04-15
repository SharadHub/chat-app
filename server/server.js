import express from "express";
import http from 'http';
import initSocket from "./socket/index.js";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from './config/db.js';
import messageRoutes from './routes/messageRoutes.js';
import authRoute from './routes/authRoute.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/messages', messageRoutes)
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
    res.send("The server is listening and alive");
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running in port ${PORT}...`);
})