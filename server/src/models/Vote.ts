import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    optionIndex: number;
    studentName: string;
    studentSessionId: string;
}

const VoteSchema: Schema = new Schema({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    optionIndex: { type: Number, required: true },
    studentName: { type: String, required: true },
    studentSessionId: { type: String, required: true },
}, { timestamps: true });

// Compound unique index on { pollId, studentSessionId } -- prevents double voting at DB level
VoteSchema.index({ pollId: 1, studentSessionId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);
