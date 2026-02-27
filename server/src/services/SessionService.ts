import Session, { ISession } from '../models/Session';

export class SessionService {
    static async registerSession(
        sessionId: string,
        socketId: string,
        name: string,
        role: 'teacher' | 'student'
    ): Promise<ISession> {
        let session = await Session.findOne({ sessionId });

        if (session) {
            session.socketId = socketId;
            session.isConnected = true;
            session.lastSeen = new Date();
            session.name = name; // Update name just in case
            session.role = role;
            await session.save();
        } else {
            session = new Session({
                sessionId,
                socketId,
                name,
                role,
                isConnected: true,
            });
            await session.save();
        }

        return session;
    }

    static async disconnectSession(socketId: string): Promise<ISession | null> {
        const session = await Session.findOneAndUpdate(
            { socketId },
            { isConnected: false, lastSeen: new Date() },
            { returnDocument: 'after' }
        );
        return session;
    }

    static async getSessionBySocketId(socketId: string): Promise<ISession | null> {
        return await Session.findOne({ socketId });
    }

    static async getSessionById(sessionId: string): Promise<ISession | null> {
        return await Session.findOne({ sessionId });
    }

    static async isNameTaken(name: string, sessionId: string): Promise<boolean> {
        // A name is taken if it's currently connected and has a different session ID
        const session = await Session.findOne({
            name,
            role: 'student',
            isConnected: true,
            sessionId: { $ne: sessionId }
        });
        return !!session;
    }

    static async getActiveStudents(): Promise<{ name: string; sessionId: string }[]> {
        const students = await Session.find({ role: 'student', isConnected: true });
        return students.map(s => ({ name: s.name, sessionId: s.sessionId }));
    }
}
