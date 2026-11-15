import RefreshToken from '../models/RefreshToken.js';
import { hashToken } from '../utils/hash.js';

import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

export const createTokenPair = async (userId: string) => {
  // generateAccessToken()
  const accessToken = generateAccessToken(userId);
  // generateRefreshToken()
  const refreshToken = generateRefreshToken(userId);
  // hashToken()
  const hashedRefreshToken = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // RefreshToken.create()
  await RefreshToken.create({
    user: userId,
    tokenHash: hashedRefreshToken,
    expiresAt,
  });
  // return { accessToken, refreshToken }
  return { accessToken, refreshToken };
};
