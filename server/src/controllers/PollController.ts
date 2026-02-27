import { Request, Response } from 'express';
import { PollService } from '../services/PollService';
import { VoteService } from '../services/VoteService';

export class PollController {
    static async getActivePoll(req: Request, res: Response) {
        try {
            const activePoll = await PollService.getActivePoll();
            res.json(activePoll);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getPollHistory(req: Request, res: Response) {
        try {
            const history = await PollService.getPollHistory();
            res.json(history);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async checkMyVote(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { sessionId } = req.query;
            if (!sessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }
            const hasVoted = await VoteService.hasVoted(id, sessionId as string);
            res.json({ hasVoted });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
