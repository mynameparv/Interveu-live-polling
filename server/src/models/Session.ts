import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    sessionId: string; // UUID from client
    socketId: string; // current active socket
    name: string;
    role: 'teacher' | 'student';
    isConnected: boolean;
    lastSeen: Date;
}

const SessionSchema: Schema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    socketId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['teacher', 'student'], required: true },
    isConnected: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
});

export default mongoose.model<ISession>('Session', SessionSchema);
