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

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
    process.env.CLIENT_URL?.replace(/\/$/, ''), // Remove trailing slash if exists
].filter(Boolean) as string[];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(allowed =>
            allowed === '*' || allowed.replace(/\/$/, '') === normalizedOrigin
        );

        if (isAllowed || origin.startsWith('http://localhost')) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked: Origin "${origin}" not in allowed list:`, allowedOrigins);
            callback(new Error('Not allowed by CORS'));
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
