import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// importing db.js
const connectDB = require('./config/db');

// import from routes
const messageRoutes = require('./routes/messageRoutes');

// import from routes
const authRoute = require('./routes/authRoute');

dotenv.config();

const app = express();

// run the execution function.
connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/messages', messageRoutes)
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
    res.send("The server is listening and alive");
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running in port ${PORT}...`);
})