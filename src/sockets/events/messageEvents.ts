import type { Server, Socket } from 'socket.io';

import {
  createMessage,
  markMessageAsRead,
} from '../../service/messageService.js';

export const registerMessageEvents = (io: Server, socket: Socket) => {
  socket.on('send-message', async (data) => {
    try {
      const { roomId, text } = data;

      if (typeof roomId !== 'string' || typeof text !== 'string') {
        throw new Error('Invalid message data');
      }

      const message = await createMessage({
        userId: socket.data.userId,
        roomId,
        text,
      });

      io.to(roomId).emit('new-message', message);
    } catch (error) {
      console.error('Send message error:', error);
    }
  });

  socket.on('message-read', async (data) => {
    try {
      const { messageId } = data ?? {};

      if (typeof messageId !== 'string') return;

      const userId = socket.data.userId;

      const message = await markMessageAsRead(userId, messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      io.to(message.room.toString()).emit('message-read', {
        messageId,
        userId,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Message read error:', error);
    }
  });
};
