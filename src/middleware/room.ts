import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

export const postRoomValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomName, isPublic, isGroup } = req.body;

    if (roomName !== undefined && typeof roomName !== 'string') {
      throw new AppError('Room name must be a string', 400);
    }

    if (roomName && roomName.trim().length > 50) {
      throw new AppError('Room name is too long', 400);
    }

    if (isPublic !== undefined && typeof isPublic !== 'boolean') {
      throw new AppError('isPublic must be a boolean', 400);
    }

    if (isGroup !== undefined && typeof isGroup !== 'boolean') {
      throw new AppError('isGroup must be a boolean', 400);
    }

    if (typeof roomName === 'string') {
      req.body.roomName = roomName.trim();
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const roomIdValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;

    if (!roomId || !mongoose.isObjectIdOrHexString(roomId)) {
      throw new AppError('Invalid room ID', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const paginationQueryValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = req.query;

    if (page !== undefined) {
      const parsedPage = Number(page);

      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        throw new AppError('Invalid page', 400);
      }
    }

    if (limit !== undefined) {
      const parsedLimit = Number(limit);

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        throw new AppError('Limit must be between 1 and 100', 400);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
