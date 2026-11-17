import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  username: string;
  tokenType: string;
}

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (
      typeof decoded === 'string' ||
      typeof decoded.userId !== 'string' ||
      decoded.tokenType !== 'access'
    ) {
      return next(new Error('Invalid token'));
    }

    socket.data.userId = decoded.userId;
    socket.data.username = decoded.username;

    next();
  } catch (error) {
    return next(new Error('Invalid or expired token'));
  }
};
