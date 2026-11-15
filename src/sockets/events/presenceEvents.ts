import { Server, Socket } from 'socket.io';
import User from '../../models/User.js';
import Room from '../../models/Room.js';

export const registerPresenceEvents = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;
  const username = socket.data.username;

  const handleConnect = async () => {
    try {
      await socket.join(userId);
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });

      const rooms = await Room.find({
        members: userId,
      }).select('_id');

      for (const room of rooms) {
        await socket.join(room._id.toString());
      }

      console.log(`${username} is online`);
    } catch (error) {
      console.error('Presence connect error:', error);
    }
  };

  void handleConnect();

  socket.on('disconnect', async () => {
    try {
      const activeSockets = await io.in(userId).fetchSockets();

      if (activeSockets.length > 0) return;

      const lastSeen = new Date();

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen,
      });

      const rooms = await Room.find({
        members: userId,
      }).select('_id');

      for (const room of rooms) {
        io.to(room._id.toString()).emit('user-offline', {
          userId,
          username,
          lastSeen,
        });
      }

      console.log(`${username} is offline`);
    } catch (error) {
      console.error('Presence disconnect error:', error);
    }
  });
};
