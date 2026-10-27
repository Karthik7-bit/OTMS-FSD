import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().then(() => console.log('Connected to Redis')).catch(console.error);

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import organRoutes from './routes/organ.routes';
import requestRoutes from './routes/request.routes';
import matchRoutes from './routes/match.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organs', organRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/matches', matchRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running', data: {} });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
