import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getRoomMessagesController,
  getRoomsController,
  postRoomController,
} from '../controllers/roomControllers.js';
import {
  paginationQueryValidate,
  postRoomValidate,
  roomIdValidate,
} from '../middleware/room.js';

const router = Router();

router.get('/rooms', authenticate, getRoomsController);
router.post('/rooms', authenticate, postRoomValidate, postRoomController);
router.get(
  '/rooms/:roomId/messages',
  authenticate,
  roomIdValidate,
  paginationQueryValidate,
  getRoomMessagesController
);

export default router;
