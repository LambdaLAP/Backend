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
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

export const User = mongoose.model<IUser>('User', UserSchema)
