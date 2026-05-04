import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import * as chat from '../controllers/chatController';

const router = Router();

router.use(authenticate);

router.get('/sessions',                    chat.getSessions);
router.post('/sessions',                   chat.createSession);
router.get('/sessions/:id/messages',       chat.getMessages);
router.post('/sessions/:id/messages',      chat.sendMessage);

export default router;
