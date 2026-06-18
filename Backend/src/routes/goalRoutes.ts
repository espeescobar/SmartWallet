import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import * as goals from '../controllers/goalController';

const router = Router();

router.use(authenticate);

router.get('/',     goals.getAll);
router.post('/',    goals.create);
router.get('/:id',  goals.getOne);
router.patch('/:id', goals.update);
router.delete('/:id', goals.remove);

// Aportes y retiros de una meta
router.post('/:id/contributions', goals.addContribution);

export default router;
