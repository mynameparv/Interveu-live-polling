import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import pollRoutes from './routes/pollRoutes';
import sessionRoutes from './routes/sessionRoutes';
import { handlePollSockets } from './handlers/PollSocketHandler';
import { TimerService } from './services/TimerService';

dotenv.config();

const app = express();
const server = http.createServer(app);

console.log('Production CLIENT_URL configured as:', process.env.CLIENT_URL);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
].filter(Boolean) as string[];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Skip check if no origin (non-browser)
        if (!origin) return callback(null, true);

        // Clean the incoming origin and the expected origin
        const normalizedOrigin = origin.trim().replace(/\/$/, '').toLowerCase();

        const isAllowed = allowedOrigins.some(allowed => {
            if (!allowed) return false;
            if (allowed === '*') return true;
            return allowed.trim().replace(/\/$/, '').toLowerCase() === normalizedOrigin;
        });

        if (isAllowed || origin.startsWith('http://localhost')) {
            callback(null, true);
        } else {
            console.error(`CORS REJECTED: "${normalizedOrigin}" is NOT in:`, allowedOrigins);
            // Pass null, false instead of an Error to avoid 500 Internal Server Error
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

// CORS setup for Express REST
app.use(cors(corsOptions));
app.use(express.json());

// Init DB
connectDB();

// Setup Socket.io
const io = new Server(server, {
    cors: corsOptions,
});

TimerService.setIoInstance(io);

// Socket Handlers
handlePollSockets(io);

// API Routes
app.use('/api/polls', pollRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
