import type { Request, Response, NextFunction } from 'express';
import type { Server } from 'socket.io';
import {
  createNotificationService,
  getNotificationListService,
  markNotificationAsReadService,
  getUnreadNotificationCountService,
} from '../service/notificationServices.js';

import { AppError } from '../utils/AppError.js';

export const createNotificationController = (io: Server) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { type, title, body } = req.body;

      if (!type || !title || !body) {
        throw new AppError('All fields are required', 400);
      }

      const notification = await createNotificationService(io, {
        recipient: userId,
        type,
        title,
        body,
      });

      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  };
};

export const getNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    const limit = Number(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const notifications = await getNotificationListService(userId, {
      limit,
      unreadOnly,
    });
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsReadController = (io: Server) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      if (typeof id !== 'string' || !id) {
        throw new AppError('Invalid notification ID', 400);
      }

      await markNotificationAsReadService(userId, id);
      const unread = await getUnreadNotificationCountService(userId);

      io.to(`user:${userId}`).emit('notification:count', { unread });

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
};
