# Database Schema Documentation

This document describes the MongoDB database schema for the Lambda LAP project using Mongoose ODM.

## Overview

The database schema consists of 9 main models representing the core entities of the learning platform:

- **User** - System users (students, instructors, admins)
- **Course** - Educational courses
- **Lesson** - Individual lessons within courses
- **Challenge** - Coding challenges within lessons
- **Enrollment** - User enrollments in courses
- **LessonProgress** - Track user progress through lessons
- **Submission** - User code submissions for challenges
- **ChatThread** - Conversation threads for help/support
- **ChatMessage** - Individual messages within chat threads

## Models

### User

Stores user account information and authentication data.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `email` (String, Unique, Required) - User's email address
- `passwordHash` (String, Required) - Hashed password
- `role` (Role Enum, Default: STUDENT) - User role
- `profileData` (Mixed, Optional) - Additional profile information
- `createdAt` (Date, Auto) - Account creation timestamp

**Role Enum Values:**
- `STUDENT` - Regular learner
- `INSTRUCTOR` - Course creator/teacher
- `ADMIN` - System administrator

### Course

Represents educational courses available on the platform.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `title` (String, Required) - Course title
- `description` (String, Required) - Course description
- `isPublished` (Boolean, Default: false) - Publication status
- `createdAt` (Date, Auto) - Course creation timestamp

### Lesson

Individual lessons that make up a course.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `courseId` (ObjectId, Required, Ref: Course) - Reference to parent course
- `title` (String, Required) - Lesson title
- `orderIndex` (Number, Required) - Order within the course
- `contentMarkdown` (String, Required) - Lesson content in Markdown format

### Challenge

Coding challenges within lessons.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `lessonId` (ObjectId, Required, Ref: Lesson) - Reference to parent lesson
- `title` (String, Required) - Challenge title
- `starterCode` (String, Required) - Initial code template
- `solutionCode` (String, Required) - Reference solution
- `testCases` (Array/Mixed, Required) - Test cases for validation

### Enrollment

Links users to courses they're enrolled in.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `userId` (ObjectId, Required, Ref: User) - Reference to user
- `courseId` (ObjectId, Required, Ref: Course) - Reference to course
- `enrolledAt` (Date, Auto) - Enrollment timestamp

**Indexes:**
- Unique compound index on (userId, courseId) - Prevents duplicate enrollments

### LessonProgress

Tracks user progress through lessons.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `userId` (ObjectId, Required, Ref: User) - Reference to user
- `lessonId` (ObjectId, Required, Ref: Lesson) - Reference to lesson
- `isCompleted` (Boolean, Default: false) - Completion status
- `completedAt` (Date, Optional) - Completion timestamp

**Indexes:**
- Unique compound index on (userId, lessonId) - One progress record per user per lesson

### Submission

User code submissions for challenges.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `userId` (ObjectId, Required, Ref: User) - Reference to user
- `challengeId` (ObjectId, Required, Ref: Challenge) - Reference to challenge
- `userCode` (String, Required) - User's submitted code
- `outputLog` (String, Required) - Execution output/logs
- `status` (Status Enum, Required) - Submission status
- `metrics` (Mixed, Required) - Execution metrics (time, memory, etc.)
- `createdAt` (Date, Auto) - Submission timestamp

**Status Enum Values:**
- `PENDING` - Awaiting execution
- `RUNNING` - Currently executing
- `PASSED` - All tests passed
- `FAILED` - One or more tests failed

### ChatThread

Conversation threads for user support and help.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `userId` (ObjectId, Required, Ref: User) - Reference to user who created the thread
- `title` (String, Required) - Thread title/subject
- `createdAt` (Date, Auto) - Thread creation timestamp
- `updatedAt` (Date, Auto-update) - Last update timestamp

### ChatMessage

Individual messages within chat threads.

**Fields:**
- `_id` (ObjectId, Auto-generated) - Unique identifier
- `threadId` (ObjectId, Required, Ref: ChatThread) - Reference to parent thread
- `role` (SenderRole Enum, Required) - Message sender role
- `content` (String, Required) - Message content
- `createdAt` (Date, Auto) - Message timestamp

**SenderRole Enum Values:**
- `USER` - Message from user
- `ASSISTANT` - Message from AI assistant
- `SYSTEM` - System-generated message

## Usage

### Connecting to the Database

```typescript
import { connect } from './utils/db'
import { User } from './models'

// Connect to MongoDB
await connect()

// Use models
const users = await User.find()
```

### Example Queries

**Create a new user:**
```typescript
import { User, Role } from './models'

const user = await User.create({
  email: 'student@example.com',
  passwordHash: 'hashed_password',
  role: Role.STUDENT,
  profileData: { firstName: 'John', lastName: 'Doe' }
})
```

**Enroll a user in a course:**
```typescript
import { Enrollment } from './models'

const enrollment = await Enrollment.create({
  userId: user._id,
  courseId: course._id
})
```

**Track lesson completion:**
```typescript
import { LessonProgress } from './models'

const progress = await LessonProgress.findOneAndUpdate(
  { userId: user._id, lessonId: lesson._id },
  {
    isCompleted: true,
    completedAt: new Date()
  },
  { upsert: true, new: true }
)
```

**Submit a challenge solution:**
```typescript
import { Submission, Status } from './models'

const submission = await Submission.create({
  userId: user._id,
  challengeId: challenge._id,
  userCode: 'function solution() { ... }',
  outputLog: 'All tests passed',
  status: Status.PASSED,
  metrics: { executionTime: 100, memoryUsed: 1024 }
})
```

**Query with population:**
```typescript
import { Enrollment } from './models'

const enrollments = await Enrollment.find({ userId: user._id })
  .populate('courseId')
  .populate('userId')
```

## Configuration

The database connection is configured through environment variables in the `.env` file:

```
DATABASE_URL="mongodb://localhost:27017/lambda_lap"
```

## Cascade Deletion

Mongoose does not have built-in cascade delete like Prisma. To implement cascade deletion, you can:

1. Use middleware hooks (pre/post hooks)
2. Manually delete related documents
3. Use MongoDB's referential actions

Example:
```typescript
// In Course model
CourseSchema.pre('deleteOne', async function(next) {
  const courseId = this.getQuery()._id
  await Lesson.deleteMany({ courseId })
  await Enrollment.deleteMany({ courseId })
  next()
})
```

## Testing

Database schema tests are located in `src/__tests__/database.test.ts`. Run tests with:

```bash
npm test
```

## Model Types

All models export TypeScript interfaces for type safety:

```typescript
import { IUser, ICourse, ILesson } from './models'

const user: IUser = await User.findById(userId)
```
