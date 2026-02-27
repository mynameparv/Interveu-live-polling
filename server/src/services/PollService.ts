import Poll, { IPoll } from '../models/Poll';

export class PollService {
    static async createPoll(
        question: string,
        options: { text: string; isCorrect: boolean }[],
        timerDuration: number,
        teacherSessionId: string
    ): Promise<IPoll> {
        // Complete any currently active poll
        await Poll.updateMany({ status: 'active' }, { status: 'completed' });

        const now = new Date();
        const endsAt = new Date(now.getTime() + timerDuration * 1000);

        const newPoll = new Poll({
            question,
            options: options.map((opt) => ({ text: opt.text, isCorrect: opt.isCorrect, voteCount: 0 })),
            timerDuration,
            status: 'active',
            createdBy: teacherSessionId,
            startedAt: now,
            endsAt,
            totalVotes: 0,
        });

        return await newPoll.save();
    }

    static async getActivePoll(): Promise<IPoll | null> {
        return await Poll.findOne({ status: 'active' });
    }

    static async completePoll(pollId: string): Promise<IPoll | null> {
        return await Poll.findByIdAndUpdate(
            pollId,
            { status: 'completed' },
            { new: true }
        );
    }

    static async getPollHistory(): Promise<IPoll[]> {
        return await Poll.find({ status: 'completed' }).sort({ startedAt: -1 });
    }
}
