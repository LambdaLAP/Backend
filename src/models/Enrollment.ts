import mongoose, { Document, Schema } from 'mongoose'

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  enrolledAt: Date
  lastAccessedAt?: Date
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    lastAccessedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'enrolledAt', updatedAt: false }
  }
)

// Unique constraint: one enrollment per user per course
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
