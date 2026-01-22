import mongoose, { Document, Schema } from 'mongoose'

export enum LessonType {
  LESSON = 'LESSON',
  CHALLENGE = 'CHALLENGE'
}

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId
  title: string
  orderIndex: number
  contentMarkdown: string
  type: LessonType
  challengeIds: mongoose.Types.ObjectId[]
}

const LessonSchema = new Schema<ILesson>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  orderIndex: {
    type: Number,
    required: true
  },
  contentMarkdown: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(LessonType),
    default: LessonType.LESSON
  },
  challengeIds: {
    type: [Schema.Types.ObjectId],
    ref: 'Challenge',
    default: []
  }
})

// Cascade delete: when a course is deleted, delete all its lessons
LessonSchema.pre('deleteMany', async function (next) {
  next()
})

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema)
