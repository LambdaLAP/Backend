import mongoose, { Document, Schema } from 'mongoose'

export interface ICourse extends Document {
  title: string
  description: string
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
