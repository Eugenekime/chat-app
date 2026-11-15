import { Server, Socket } from 'socket.io';
import Room from '../../models/Room.js';

export const registerTypingEvents = (io: Server, socket: Socket) => {
  socket.on('typing', async (data) => {
    try {
      const { roomId, isTyping } = data ?? {};

      if (typeof roomId !== 'string' || typeof isTyping !== 'boolean') {
        return;
      }

      const userId = socket.data.userId;
      const username = socket.data.username;

      // Check room access
      const hasAccess = await Room.exists({
        _id: roomId,
        members: userId,
      });

      if (!hasAccess) return;

      // Broadcast to other room members
      socket.to(roomId).emit('user-typing', {
        userId,
        username,
        isTyping,
      });
    } catch (error) {
      console.error('Typing error:', error);
    }
  });
};
