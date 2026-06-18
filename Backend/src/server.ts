import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middlewares/requestLogger';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import apiRoutes from './routes';

const app = express();

// ── Seguridad y parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// ── Logging ──────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ── Fallbacks (deben ir al final) ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
