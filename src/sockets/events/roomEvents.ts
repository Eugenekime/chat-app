import { Server, Socket } from 'socket.io';
import Room from '../../models/Room.js';

export const registerRoomEvents = (io: Server, socket: Socket) => {
  socket.on('join-room', async (data) => {
    try {
      const { roomId } = data ?? {};

      if (typeof roomId !== 'string') return;

      const userId = socket.data.userId;
      const username = socket.data.username;

      // Check access
      const room = await Room.findOne({
        _id: roomId,
        members: userId,
      });

      if (!room) return;

      // Join room
      await socket.join(roomId);

      // Notify other members
      socket.to(roomId).emit('user-joined-room', {
        userId,
        username,
      });
    } catch (error) {
      console.error('Join room error:', error);
    }
  });

  socket.on('leave-room', async (data) => {
    try {
      const { roomId } = data ?? {};

      if (typeof roomId !== 'string') return;

      const userId = socket.data.userId;
      const username = socket.data.username;

      // Leave Socket.IO room
      await socket.leave(roomId);

      // Notify remaining members
      socket.to(roomId).emit('user-left-room', {
        userId,
        username,
      });
    } catch (error) {
      console.error('Leave room error:', error);
    }
  });
};
