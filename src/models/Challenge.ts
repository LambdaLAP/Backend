import mongoose, { Document, Schema } from 'mongoose'

export interface IStarterCodes {
  python?: string
  cpp?: string
  java?: string
  javascript?: string
  typescript?: string
  go?: string
  rust?: string
}

export interface ITestCase {
  input: any
  expectedOutput: any
  isHidden: boolean
}

export interface IChallenge extends Document {
  lessonId: mongoose.Types.ObjectId
  title: string
  starterCodes: IStarterCodes
  solutionCodes: IStarterCodes
  testCases: ITestCase[]
}

const ChallengeSchema = new Schema<IChallenge>({
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  starterCodes: {
    type: {
      python: { type: String },
      cpp: { type: String },
      java: { type: String },
      javascript: { type: String },
      typescript: { type: String },
      go: { type: String },
      rust: { type: String }
    },
    required: true,
    validate: {
      validator: function (v: IStarterCodes) {
        // At least one language must be provided
        return Object.values(v).some(code => code && code.trim().length > 0)
      },
      message: 'At least one starter code language must be provided'
    }
  },
  solutionCodes: {
    type: {
      python: { type: String },
      cpp: { type: String },
      java: { type: String },
      javascript: { type: String },
      typescript: { type: String },
      go: { type: String },
      rust: { type: String }
    },
    required: true,
    validate: {
      validator: function (v: IStarterCodes) {
        // At least one language must be provided
        return Object.values(v).some(code => code && code.trim().length > 0)
      },
      message: 'At least one solution code language must be provided'
    }
  },
  testCases: {
    type: [
      {
        input: { type: Schema.Types.Mixed, required: true },
        expectedOutput: { type: Schema.Types.Mixed, required: true },
        isHidden: { type: Boolean, required: true, default: false }
      }
    ],
    required: true,
    default: []
  }
})

export const Challenge = mongoose.model<IChallenge>('Challenge', ChallengeSchema)
