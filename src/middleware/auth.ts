import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('Unauthorized', 401));
  }

  try {
    const decoded = verifyAccessToken(token);

    if (
      typeof decoded === 'string' ||
      typeof decoded.userId !== 'string' ||
      decoded.tokenType !== 'access'
    ) {
      return next(new AppError('Invalid token', 401));
    }

    req.user = decoded;
    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
};

export const registerValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('All fields are required', 400));
  }

  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return next(new AppError('Invalid data types', 400));
  }

  const trimmedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return next(
      new AppError('Username must be between 3 and 30 characters', 400)
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return next(new AppError('Invalid email format', 400));
  }

  if (password.length < 8) {
    return next(
      new AppError('Password must contain at least 8 characters', 400)
    );
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return next(
      new AppError(
        'Password must contain at least one letter and one number',
        400
      )
    );
  }

  req.body.username = trimmedUsername;
  req.body.email = normalizedEmail;

  next();
};

export const loginValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('All fields are required', 400));
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(new AppError('Invalid data types', 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return next(new AppError('Invalid email format', 400));
  }

  if (password.length < 8) {
    return next(
      new AppError('Password must contain at least 8 characters', 400)
    );
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return next(
      new AppError(
        'Password must contain at least one letter and one number',
        400
      )
    );
  }
  req.body.email = normalizedEmail;

  next();
};
