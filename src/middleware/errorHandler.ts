import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  const message =
    err instanceof AppError ? err.message : 'Internal Server Error';

  if (!(err instanceof AppError)) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
