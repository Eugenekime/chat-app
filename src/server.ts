import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';
import { socketAuthMiddleware } from './sockets/socketAuthMiddleware.js';
import { registerSocketHandlers } from './sockets/socketHandlers.js';

import authRoute from './routers/authRoutes.js';
import roomRoute from './routers/roomRoutes.js';
import notificationRouter from './routers/notificationRoutes.js';

import { getUnreadNotificationCountService } from './service/notificationServices.js';

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on('connection', async (socket) => {
  console.log('User connected:', socket.data.userId);
  socket.join(`user:${socket.data.userId}`);

  try {
    const unread = await getUnreadNotificationCountService(socket.data.userId);

    socket.emit('notification:count', { unread });
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
  }
  registerSocketHandlers(io, socket);
});

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', notificationRouter(io));
app.use('/api', authRoute);
app.use('/api', roomRoute);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3000;

  http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
