import type { Server, Socket } from 'socket.io';

import { registerMessageEvents } from './events/messageEvents.js';
import { registerRoomEvents } from './events/roomEvents.js';
import { registerTypingEvents } from './events/typingEvents.js';
import { registerPresenceEvents } from './events/presenceEvents.js';

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  registerMessageEvents(io, socket);
  registerRoomEvents(io, socket);
  registerTypingEvents(io, socket);
  registerPresenceEvents(io, socket);
};
