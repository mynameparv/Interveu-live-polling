import Vote from '../models/Vote';
import Poll from '../models/Poll';
import mongoose from 'mongoose';

export class VoteService {
    // In-memory set for quick rejection (pollId:sessionId)
    private static voteCache = new Set<string>();

    static async recordVote(
        pollId: string,
        optionIndex: number,
        studentName: string,
        studentSessionId: string
    ): Promise<boolean> {
        const cacheKey = `${pollId}:${studentSessionId}`;
        if (this.voteCache.has(cacheKey)) {
            throw new Error('Already voted in this poll');
        }

        try {
            // Create vote record first (this relies on the unique compound index in DB)
            const vote = new Vote({
                pollId: new mongoose.Types.ObjectId(pollId),
                optionIndex,
                studentName,
                studentSessionId,
            });
            await vote.save();

            // If successful, add to cache
            this.voteCache.add(cacheKey);

            // Atomically increment the vote count for the specific option and totalVotes
            await Poll.updateOne(
                { _id: pollId },
                {
                    $inc: {
                        [`options.${optionIndex}.voteCount`]: 1,
                        totalVotes: 1,
                    },
                }
            );

            return true;
        } catch (error: any) {
            if (error.code === 11000) {
                // Duplicate key error
                this.voteCache.add(cacheKey); // Ensure it's in cache
                throw new Error('Already voted in this poll');
            }
            throw error;
        }
    }

    static async hasVoted(pollId: string, studentSessionId: string): Promise<boolean> {
        const cacheKey = `${pollId}:${studentSessionId}`;
        if (this.voteCache.has(cacheKey)) return true;

        const vote = await Vote.findOne({ pollId, studentSessionId });
        if (vote) {
            this.voteCache.add(cacheKey);
            return true;
        }
        return false;
    }

    static async removeVote(pollId: string, studentSessionId: string): Promise<boolean> {
        const cacheKey = `${pollId}:${studentSessionId}`;

        try {
            const vote = await Vote.findOneAndDelete({ pollId: new mongoose.Types.ObjectId(pollId), studentSessionId });
            if (vote) {
                this.voteCache.delete(cacheKey);

                await Poll.updateOne(
                    { _id: pollId },
                    {
                        $inc: {
                            [`options.${vote.optionIndex}.voteCount`]: -1,
                            totalVotes: -1,
                        },
                    }
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing vote:', error);
            return false;
        }
    }
}
