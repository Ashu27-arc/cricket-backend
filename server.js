// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const matchesRouter = require('./routes/matches');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in .env');
    process.exit(1);
}

connectDB(MONGO_URI);

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '2mb' })); // accept JSON bodies

// Make io available to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// routes
app.use('/api/matches', matchesRouter);

// simple health route
app.get('/', (req, res) => res.send('Cricket Scoring Backend is running'));

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join a specific match room
    socket.on('join-match', (matchId) => {
        socket.join(`match-${matchId}`);
        console.log(`User ${socket.id} joined match ${matchId}`);
        
        // Send current match status to newly joined user
        socket.emit('joined-match', { matchId, message: 'Successfully joined match room' });
    });
    
    // Leave match room
    socket.on('leave-match', (matchId) => {
        socket.leave(`match-${matchId}`);
        console.log(`User ${socket.id} left match ${matchId}`);
    });
    
    // Join all live matches room for general updates
    socket.on('join-live-matches', () => {
        socket.join('live-matches');
        console.log(`User ${socket.id} joined live matches room`);
    });
    
    // Leave live matches room
    socket.on('leave-live-matches', () => {
        socket.leave('live-matches');
        console.log(`User ${socket.id} left live matches room`);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`WebSocket server ready for live updates`);
});
