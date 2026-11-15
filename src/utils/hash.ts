import { createHash } from 'crypto';
import bcrypt from 'bcrypt';

export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
