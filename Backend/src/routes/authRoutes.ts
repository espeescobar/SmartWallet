import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { validateBody }  from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateMeSchema,
} from '../validators/authValidators';
import * as auth from '../controllers/authController';

const router = Router();

// ── Rutas públicas ────────────────────────────────────────────────────────────
router.post('/register', validateBody(registerSchema), auth.register);
router.post('/login',    validateBody(loginSchema),    auth.login);
router.post('/refresh',  validateBody(refreshSchema),  auth.refreshToken);

// logout requiere auth: solo puede cerrar sesión quien tiene un token válido
router.post('/logout', authenticate, auth.logout);

// ── Rutas protegidas ──────────────────────────────────────────────────────────
router.get('/me',    authenticate,                              auth.me);
router.patch('/me',  authenticate, validateBody(updateMeSchema), auth.updateMe);

export default router;