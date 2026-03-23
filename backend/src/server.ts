import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import linksRoutes from './routes/links.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import messageRoutes from './routes/message.routes.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import {
  notFoundHandler,
  globalErrorHandler,
} from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(generalLimiter);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/links', linksRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/messages', messageRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
