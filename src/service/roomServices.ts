import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { AppError } from '../utils/AppError.js';

export const getRoomsService = async (userId: string) => {
  return await Room.find({
    $or: [{ isPublic: true }, { members: userId }],
  }).sort({ lastActivity: -1 });
};

export const postRoomService = async (
  userId: string,
  roomName?: string,
  isPublic: boolean = true,
  isGroup: boolean = false
) => {
  return await Room.create({
    name: roomName?.trim() ?? '',
    members: [userId],
    admins: [userId],
    isGroup,
    isPublic,
    createdBy: userId,
  });
};

export const getRoomMessagesService = async (
  userId: string,
  roomId: string,
  page: number = 1,
  limit: number = 50
) => {
  const room = await Room.findOne({ _id: roomId, members: userId });
  if (!room) {
    throw new AppError('Room not found or access denied', 404);
  }
  const skip = (page - 1) * limit;

  const [messages, totalMessages] = await Promise.all([
    Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Message.countDocuments({ room: roomId }),
  ]);

  return {
    messages: messages.reverse(),
    totalMessages,
    totalPages: Math.ceil(totalMessages / limit),
  };
};
