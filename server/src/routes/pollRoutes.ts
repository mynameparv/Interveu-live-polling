import { Router } from 'express';
import { PollController } from '../controllers/PollController';

const router = Router();

router.get('/active', PollController.getActivePoll);
router.get('/history', PollController.getPollHistory);
router.get('/:id/my-vote', PollController.checkMyVote);

export default router;
