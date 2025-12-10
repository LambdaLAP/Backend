import mongoose, { Document, Schema } from 'mongoose'

export interface ILessonProgress extends Document {
  userId: mongoose.Types.ObjectId
  lessonId: mongoose.Types.ObjectId
  isCompleted: boolean
  completedAt?: Date
}

const LessonProgressSchema = new Schema<ILessonProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
})

// Unique constraint: one progress record per user per lesson
LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true })

export const LessonProgress = mongoose.model<ILessonProgress>(
  'LessonProgress',
  LessonProgressSchema
)
