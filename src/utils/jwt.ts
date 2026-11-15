import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, username: string) => {
  return jwt.sign(
    { userId, username, tokenType: 'access' },
    process.env.JWT_SECRET!,
    {
      expiresIn: '15m',
    }
  );
};
export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId, tokenType: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '7d',
    }
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
};
