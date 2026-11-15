import type { Request, Response, NextFunction } from 'express';
import {
  getRoomMessagesService,
  getRoomsService,
  postRoomService,
} from '../service/roomServices.js';
import { AppError } from '../utils/AppError.js';

export const getRoomsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const rooms = await getRoomsService(userId);
    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const postRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { roomName, isPublic, isGroup } = req.body;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const room = await postRoomService(userId, roomName, isPublic, isGroup);

    return res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;
    if (typeof roomId !== 'string') {
      throw new AppError('Invalid room ID', 400);
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const result = await getRoomMessagesService(userId, roomId, page, limit);
    return res.status(200).json({
      success: true,
      data: result.messages,
      metaData: {
        limit,
        page,
        totalMessages: result.totalMessages,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};
