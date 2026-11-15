import type { Request, Response, NextFunction } from 'express';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

import { hashToken } from '../utils/hash.js';
import RefreshToken from '../models/RefreshToken.js';
import { AppError } from '../utils/AppError.js';
import { loginService, registerService } from '../service/authServices.js';
import { createTokenPair } from '../service/tokenServices.js';

const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60 * 1000;

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    const user = await registerService(username, password, email);
    const { accessToken, refreshToken } = await createTokenPair(
      user._id.toString()
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return next(new AppError('Refresh token not provided', 401));
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(token);

    if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
      throw new AppError('Invalid token payload', 401);
    }
  } catch {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
    });

    return res.status(401).json({
      message: 'Invalid or expired refresh token',
    });
  }

  try {
    const oldToken = await RefreshToken.findOneAndDelete({
      user: decoded.userId,
      tokenHash: hashToken(token),
    });

    if (!oldToken) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
      });

      return res.status(401).json({
        message: 'Refresh token revoked or not found',
      });
    }

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    await RefreshToken.create({
      user: decoded.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES),
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRES,
      path: '/api/auth',
    });

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    const user = await loginService(email, password);
    const { accessToken, refreshToken } = await createTokenPair(
      user._id.toString()
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};
