import { Router } from 'express';
import { Server } from 'socket.io';
import {
  notificationBodyValidate,
  NotificationIdValidate,
  notificationQueryValidate,
} from '../middleware/notification.js';
import { authenticate } from '../middleware/auth.js';
import {
  createNotificationController,
  getNotificationsController,
  markNotificationAsReadController,
} from '../controllers/notificationControllers.js';

const notificationRouter = (io: Server) => {
  const router = Router();

  router.post(
    '/notifications',
    authenticate,
    notificationBodyValidate,
    createNotificationController(io)
  );
  router.get(
    '/notifications',
    authenticate,
    notificationQueryValidate,
    getNotificationsController
  );
  router.patch(
    '/notifications/:id/read',
    authenticate,
    NotificationIdValidate,
    markNotificationAsReadController(io)
  );

  return router;
};

export default notificationRouter;
