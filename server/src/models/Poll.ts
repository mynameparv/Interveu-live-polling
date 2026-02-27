import mongoose, { Schema, Document } from 'mongoose';

export interface IPoll extends Document {
    question: string;
    options: { text: string; voteCount: number; isCorrect: boolean }[];
    timerDuration: number; // in seconds
    status: 'active' | 'completed';
    createdBy: string; // teacher session ID
    startedAt: Date;
    endsAt: Date;
    totalVotes: number;
}

const PollSchema: Schema = new Schema({
    question: { type: String, required: true },
    options: [
        {
            text: { type: String, required: true },
            voteCount: { type: Number, default: 0 },
            isCorrect: { type: Boolean, default: false },
        },
    ],
    timerDuration: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    createdBy: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    endsAt: { type: Date, required: true },
    totalVotes: { type: Number, default: 0 },
});

export default mongoose.model<IPoll>('Poll', PollSchema);
