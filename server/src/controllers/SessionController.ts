import { Request, Response } from 'express';
import { SessionService } from '../services/SessionService';

export class SessionController {
    static async validateName(req: Request, res: Response) {
        try {
            const { name, sessionId } = req.body;
            if (!name || !sessionId) {
                return res.status(400).json({ error: 'Name and session ID are required' });
            }

            const isTaken = await SessionService.isNameTaken(name, sessionId);
            res.json({ isTaken });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
