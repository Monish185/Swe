// const express = require('express')
// const axios = require('axios');
// const cors = require('cors')
// const dotenv = require('dotenv')
// dotenv.config()
// const connectDB = require('./db/db')
// connectDB();
// const authRoutes = require('./Routes/authRoutes')
// const apiRoutes = require('./Routes/githubRoutes')
// const cookieParser = require('cookie-parser')
// const session = require('express-session')

// const app = express()
// const PORT = 3000

// const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
// app.use(cors({
//     origin: FRONTEND_ORIGIN,
//     credentials: true,
//     methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//     allowedHeaders: ['Content-Type','Authorization','X-Requested-With','X-Hub-Signature-256','X-GitHub-Event']
// }));
// app.use(express.json());
// app.use(cookieParser());

// app.use(session({
//     secret: process.env.SESSION_SECRET || "supersecret",
//     resave: false,
//     saveUninitialized: true,
//     cookie:{
//         secure: false,
//         httpOnly: true,
//         sameSite:"lax"
//     }
// }))

// app.use('/auth',authRoutes)
// app.use('/api', apiRoutes)
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./db/db');
connectDB();

const authRoutes = require('./Routes/authRoutes');
const apiRoutes = require('./Routes/githubRoutes');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const repoController = require('./controllers/repoController');  // <-- IMPORTANT

const app = express();
const PORT = 3000;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','X-Hub-Signature-256','X-GitHub-Event']
}));

// ----------------------------------------------------
// ✅ GitHub Webhook MUST come BEFORE express.json()
// ----------------------------------------------------
app.post(
    '/api/github/webhook',
    express.raw({ type: 'application/json' }),  // must get raw buffer
    repoController.githubWebhookHandler
);

// ----------------------------------------------------
// Normal middleware AFTER webhook
// ----------------------------------------------------
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
}));

// Now load routes that use JSON
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
