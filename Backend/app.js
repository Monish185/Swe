const express = require('express')
const axios = require('axios');
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const connectDB = require('./db/db')
connectDB();
const authRoutes = require('./Routes/authRoutes')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express()
const PORT = 3000

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: true,
    cookie:{
        secure: false,
        httpOnly: true,
        sameSite:"lax"
    }
}))

app.use('/auth',authRoutes)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

