import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    readBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
MessageSchema.index({ room: 1, createdAt: -1 });

const Message = mongoose.model('Message', MessageSchema);

export default Message;
