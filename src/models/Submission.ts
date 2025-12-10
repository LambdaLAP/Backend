import mongoose, { Document, Schema } from 'mongoose'

export enum Status {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED'
}

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId
  challengeId: mongoose.Types.ObjectId
  userCode: string
  outputLog: string
  status: Status
  metrics: Record<string, any>
  createdAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true
    },
    userCode: {
      type: String,
      required: true
    },
    outputLog: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(Status),
      required: true
    },
    metrics: {
      type: Schema.Types.Mixed,
      required: true,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema)
