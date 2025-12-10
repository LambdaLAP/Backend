import mongoose, { Document, Schema } from 'mongoose'

export interface IChatThread extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  createdAt: Date
  updatedAt: Date
}

const ChatThreadSchema = new Schema<IChatThread>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

export const ChatThread = mongoose.model<IChatThread>('ChatThread', ChatThreadSchema)
