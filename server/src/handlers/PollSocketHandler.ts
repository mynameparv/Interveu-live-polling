import { Server, Socket } from 'socket.io';
import { SessionService } from '../services/SessionService';
import { PollService } from '../services/PollService';
import { VoteService } from '../services/VoteService';

const chatHistory: Array<{ message: string; senderName: string; senderRole: 'teacher' | 'student'; timestamp: string }> = [];

export const handlePollSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {

        // Both: Register/reconnect session
        socket.on('session:join', async (data: { sessionId: string; name: string; role: 'teacher' | 'student' }) => {
            try {
                const session = await SessionService.registerSession(data.sessionId, socket.id, data.name, data.role);

                if (session.role === 'teacher') {
                    socket.join('teachers');
                } else {
                    socket.join('students');
                    // Broadcast new student joined
                    const students = await SessionService.getActiveStudents();
                    io.emit('participants:update', students);
                }

                // Automatically send state to new joiner
                const activePoll = await PollService.getActivePoll();
                let hasVoted = false;
                if (session.role === 'student' && activePoll) {
                    hasVoted = await VoteService.hasVoted(String(activePoll._id), data.sessionId);
                }

                socket.emit('state:recovered', {
                    activePoll,
                    hasVoted,
                    serverTime: new Date().toISOString()
                });
            } catch (error) {
                console.error('Session join error', error);
            }
        });

        // Both: State recovery
        socket.on('state:recover', async (data: { sessionId: string }) => {
            try {
                const session = await SessionService.getSessionById(data.sessionId);
                if (!session) return;

                const activePoll = await PollService.getActivePoll();
                let hasVoted = false;

                if (session.role === 'student' && activePoll) {
                    hasVoted = await VoteService.hasVoted(String(activePoll._id), session.sessionId);
                }

                socket.emit('state:recovered', {
                    activePoll,
                    hasVoted,
                    serverTime: new Date().toISOString()
                });

            } catch (error) {
                console.error('State recover error', error);
            }
        });

        // Teacher: Create and broadcast new poll
        socket.on('poll:create', async (data: { question: string; options: { text: string; isCorrect: boolean }[]; timerDuration: number; sessionId: string }) => {
            try {
                const session = await SessionService.getSessionBySocketId(socket.id);
                if (!session || session.role !== 'teacher') return;

                const newPoll = await PollService.createPoll(data.question, data.options, data.timerDuration, data.sessionId);

                // TimerService.startTimer should be called from controller, let's keep logic simple
                // It's already in TimerService, we'll start it here.
                // Wait, I should import TimerService.
                // I will update this file to import TimerService later.

                socket.emit('poll:created', newPoll);
                io.to('students').emit('poll:new', newPoll);

            } catch (error) {
                console.error('Create poll error', error);
            }
        });

        // Student: Submit vote
        socket.on('poll:vote', async (data: { pollId: string; optionIndex: number; studentSessionId: string }) => {
            try {
                const session = await SessionService.getSessionBySocketId(socket.id);
                if (!session || session.role !== 'student') return;

                await VoteService.recordVote(data.pollId, data.optionIndex, session.name, data.studentSessionId);

                socket.emit('poll:vote-ack', { success: true });

                // Broadcast updated tallies to all
                // Getting updated poll
                const updatedPoll = await PollService.getActivePoll();
                io.emit('poll:results-update', updatedPoll);

            } catch (error: any) {
                socket.emit('poll:vote-ack', { success: false, error: error.message });
            }
        });

        // Teacher: Kick a student
        socket.on('student:kick', async (data: { sessionId: string }) => {
            try {
                const session = await SessionService.getSessionBySocketId(socket.id);
                if (!session || session.role !== 'teacher') return;

                const studentSession = await SessionService.getSessionById(data.sessionId);
                if (studentSession && studentSession.socketId) {
                    // Notify the kicked student
                    io.to(studentSession.socketId).emit('session:kicked');

                    // Force disconnect at server side
                    const targetSocket = io.sockets.sockets.get(studentSession.socketId);
                    if (targetSocket) {
                        targetSocket.disconnect(true);
                    }

                    // Check if there is an active poll and if they have voted
                    const activePoll = await PollService.getActivePoll();
                    if (activePoll) {
                        const voteRemoved = await VoteService.removeVote(String(activePoll._id), data.sessionId);
                        if (voteRemoved) {
                            // Broadcast updated tallies to all
                            const updatedPoll = await PollService.getActivePoll();
                            io.emit('poll:results-update', updatedPoll);
                        }
                    }
                }
            } catch (error) { }
        });

        // Both: Chat history request
        socket.on('chat:request-history', () => {
            socket.emit('chat:history', chatHistory);
        });

        // Both: Participants list request
        socket.on('participants:request', async () => {
            const students = await SessionService.getActiveStudents();
            socket.emit('participants:update', students);
        });

        // Both: Chat Messaging
        socket.on('chat:message', async (data: { message: string, sessionId: string }) => {
            try {
                const session = await SessionService.getSessionById(data.sessionId);
                if (!session) return;

                const messageObj = {
                    message: data.message,
                    senderName: session.name,
                    senderRole: session.role as 'teacher' | 'student',
                    timestamp: new Date().toISOString()
                };

                // Keep last 100 messages
                if (chatHistory.length > 100) chatHistory.shift();
                chatHistory.push(messageObj);

                io.emit('chat:receive', messageObj);
            } catch (error) {
                console.error('Chat error', error);
            }
        });

        socket.on('disconnect', async () => {
            const session = await SessionService.disconnectSession(socket.id);
            if (session && session.role === 'student') {
                const students = await SessionService.getActiveStudents();
                io.emit('participants:update', students);
            }
        });
    });
};
