import express, { Request } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import subscriptionRoutes from './routes/subscriptions';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({
  verify: (req: Request, res, buf) => {
    if ((req as any).originalUrl.startsWith('/api/subscriptions/webhook')) {
      (req as any).rawBody = buf;
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 