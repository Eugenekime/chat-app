import User from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { AppError } from '../utils/AppError.js';

export const registerService = async (
  username: string,
  password: string,
  email: string
) => {
  const user = await User.findOne({ email });
  if (user) {
    throw new AppError('User already exist', 409);
  }
  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return newUser;
};

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }
  return user;
};
