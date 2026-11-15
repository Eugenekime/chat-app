import mongoose, { Schema } from 'mongoose';

const RoomSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isGroup: { type: Boolean, default: false },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ members: 1, lastActivity: -1 });
RoomSchema.index({ isPublic: 1, lastActivity: -1 });

const Room = mongoose.model('Room', RoomSchema);

export default Room;
