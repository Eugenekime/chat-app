import Notification from '../models/Notification.js';
import type { Server } from 'socket.io';
import { AppError } from '../utils/AppError.js';

interface CreateNotificationData {
  recipient: string;
  type: 'INFO' | 'WARNING' | 'ORDER' | 'SYSTEM';
  title: string;
  body: string;
}

interface GetNotificationListQuery {
  limit: number;
  unreadOnly: boolean;
}

export const createNotificationService = async (
  io: Server,
  data: CreateNotificationData
) => {
  const notification = await Notification.create(data);
  const unread = await getUnreadNotificationCountService(data.recipient);

  io.to(`user:${data.recipient}`).emit('notification:new', notification);

  io.to(`user:${data.recipient}`).emit('notification:count', { unread });

  return notification;
};

export const getNotificationListService = async (
  userId: string,
  data: GetNotificationListQuery
) => {
  const filter: {
    recipient: string;
    read?: boolean;
  } = {
    recipient: userId,
  };

  if (data.unreadOnly) {
    filter.read = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(data.limit);

  return notifications;
};

export const markNotificationAsReadService = async (
  userId: string,
  notificationId: string
) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      $set: { read: true },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
};

export const getUnreadNotificationCountService = async (userId: string) => {
  return Notification.countDocuments({
    recipient: userId,
    read: false,
  });
};
