import { Router } from 'express';
import { authenticate }  from '../middlewares/authenticate';
import { validateBody, validateQuery } from '../middlewares/validate';
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
} from '../validators/transactionValidators';
import * as tx from '../controllers/transactionController';

const router = Router();

router.use(authenticate);

router.get(    '/',     validateQuery(listTransactionsQuerySchema), tx.getAll);
router.post(   '/',     validateBody(createTransactionSchema),      tx.create);
router.delete( '/:id',                                              tx.remove);

export default router;
