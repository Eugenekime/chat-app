import mongoose from 'mongoose';

import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { AppError } from '../utils/AppError.js';

interface CreateMessageParams {
  userId: string;
  roomId: string;
  text: string;
}

export const createMessage = async ({
  userId,
  roomId,
  text,
}: CreateMessageParams) => {
  // 1. Validate input
  if (!mongoose.isValidObjectId(roomId)) {
    throw new AppError('Invalid room ID', 400);
  }

  if (typeof text !== 'string' || !text.trim()) {
    throw new AppError('Message cannot be empty', 400);
  }

  if (text.trim().length > 5000) {
    throw new AppError('Message is too long', 400);
  }

  // 2. Check room access
  const room = await Room.findOne({
    _id: roomId,
    members: userId,
  });

  if (!room) {
    throw new AppError('Room not found or access denied', 404);
  }

  // 3. Create message
  const message = await Message.create({
    room: roomId,
    sender: userId,
    text: text.trim(),
  });

  // 4. Update room activity
  room.lastMessage = message._id;
  room.lastActivity = message.createdAt;

  await room.save();

  // 5. Return created message
  return message;
};

export const markMessageAsRead = async (userId: string, messageId: string) => {
  if (!mongoose.isValidObjectId(messageId)) {
    throw new AppError('Invalid message ID', 400);
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  const hasAccess = await Room.exists({
    _id: message.room,
    members: userId,
  });

  if (!hasAccess) {
    throw new AppError('Access denied', 403);
  }

  await Message.updateOne(
    {
      _id: messageId,
      'readBy.user': { $ne: userId },
    },
    {
      $push: {
        readBy: {
          user: userId,
          readAt: new Date(),
        },
      },
    }
  );

  return Message.findById(messageId);
};
