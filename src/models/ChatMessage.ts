import mongoose, { Document, Schema } from 'mongoose'

export enum SenderRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export interface IChatMessage extends Document {
  threadId: mongoose.Types.ObjectId
  role: SenderRole
  content: string
  createdAt: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatThread',
      required: true
    },
    role: {
      type: String,
      enum: Object.values(SenderRole),
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)
