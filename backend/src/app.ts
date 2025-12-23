import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import connectorRoutes from './routes/connectorRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { requireAuth } from './middleware/auth.js';
import { me } from './controllers/authController.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', version: env.appVersion });
});

app.use('/api/auth', authRoutes);
app.get('/api/me', requireAuth, me);
app.use('/api/users', userRoutes);
app.use('/api/connectors', connectorRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api', systemRoutes);

const openApiPath = path.resolve('openapi.json');
const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ message: err.message });
});

export default app;
