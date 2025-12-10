import mongoose, { Document, Schema } from 'mongoose'

export enum Role {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  email: string
  passwordHash: string
  role: Role
  profileData?: Record<string, any>
  stats?: {
    streakDays: number
    totalXp: number
    lessonsCompleted: number
  }
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT
    },
    profileData: {
      type: Schema.Types.Mixed,
      default: null
    },
    stats: {
      type: {
        streakDays: { type: Number, default: 0 },
        totalXp: { type: Number, default: 0 },
        lessonsCompleted: { type: Number, default: 0 }
      },
      default: {
        streakDays: 0,
        totalXp: 0,
        lessonsCompleted: 0
      }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

export const User = mongoose.model<IUser>('User', UserSchema)
