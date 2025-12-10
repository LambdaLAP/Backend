import mongoose, { Document, Schema } from 'mongoose'

export interface IChallenge extends Document {
  lessonId: mongoose.Types.ObjectId
  title: string
  starterCode: string
  solutionCode: string
  testCases: any[]
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
  starterCode: {
    type: String,
    required: true
  },
  solutionCode: {
    type: String,
    required: true
  },
  testCases: {
    type: Schema.Types.Mixed,
    required: true,
    default: []
  }
})

export const Challenge = mongoose.model<IChallenge>('Challenge', ChallengeSchema)
