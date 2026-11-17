import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export const notificationQueryValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, unReadOnly } = req.query;

    if (limit !== undefined) {
      const parsedLimit = Number(limit);

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        throw new AppError('Limit must be an integer between 1 and 100', 400);
      }

      req.query.limit = String(parsedLimit);
    }

    if (
      unReadOnly !== undefined &&
      unReadOnly !== 'true' &&
      unReadOnly !== 'false'
    ) {
      throw new AppError('unReadOnly must be true or false', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const notificationBodyValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, title, body } = req.body;

    const allowedTypes = ['INFO', 'WARNING', 'ORDER', 'SYSTEM'];

    if (!type || !allowedTypes.includes(type)) {
      throw new AppError('Invalid notification type', 400);
    }

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > 100
    ) {
      throw new AppError(
        'Title must be a non-empty string (max 100 characters)',
        400
      );
    }

    if (typeof body !== 'string' || !body.trim() || body.trim().length > 1000) {
      throw new AppError(
        'Body must be a non-empty string (max 1000 characters)',
        400
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const NotificationIdValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isObjectIdOrHexString(id)) {
      throw new AppError('Invalid notification ID', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
