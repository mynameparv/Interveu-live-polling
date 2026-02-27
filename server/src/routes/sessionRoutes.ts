import { Router } from 'express';
import { SessionController } from '../controllers/SessionController';

const router = Router();

router.post('/validate-name', SessionController.validateName);

export default router;
