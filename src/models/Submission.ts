import mongoose, { Document, Schema } from 'mongoose'

export enum Status {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED'
}

export enum SubmissionLanguage {
  PYTHON = 'python',
  CPP = 'cpp',
  JAVA = 'java',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  GO = 'go',
  RUST = 'rust'
}

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId
  challengeId: mongoose.Types.ObjectId
  userCode: string
  language: SubmissionLanguage
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
    language: {
      type: String,
      enum: Object.values(SubmissionLanguage),
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
