import mongoose, { Document, Schema } from 'mongoose'

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface ICourse extends Document {
  title: string
  description: string
  difficulty: Difficulty
  tags: string[]
  isPublished: boolean
  createdAt: Date
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: Object.values(Difficulty),
      default: Difficulty.BEGINNER
    },
    tags: {
      type: [String],
      default: []
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

export const Course = mongoose.model<ICourse>('Course', CourseSchema)
