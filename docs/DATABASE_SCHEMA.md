# Database Schema Documentation

This document describes the MongoDB database schema for the Lambda LAP project using Prisma ORM.

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
- `id` (ObjectId, Primary Key) - Unique identifier
- `email` (String, Unique, Required) - User's email address
- `passwordHash` (String, Required) - Hashed password
- `role` (Role Enum, Default: STUDENT) - User role
- `profileData` (JSON, Optional) - Additional profile information
- `createdAt` (DateTime, Auto) - Account creation timestamp

**Relationships:**
- Has many: Enrollments, LessonProgress, Submissions, ChatThreads

**Role Enum Values:**
- `STUDENT` - Regular learner
- `INSTRUCTOR` - Course creator/teacher
- `ADMIN` - System administrator

### Course

Represents educational courses available on the platform.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `title` (String, Required) - Course title
- `description` (String, Required) - Course description
- `isPublished` (Boolean, Default: false) - Publication status
- `createdAt` (DateTime, Auto) - Course creation timestamp

**Relationships:**
- Has many: Lessons, Enrollments

### Lesson

Individual lessons that make up a course.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `courseId` (ObjectId, Required, Foreign Key) - Reference to parent course
- `title` (String, Required) - Lesson title
- `orderIndex` (Int, Required) - Order within the course
- `contentMarkdown` (String, Required) - Lesson content in Markdown format

**Relationships:**
- Belongs to: Course (Cascade delete)
- Has many: Challenges, LessonProgress

### Challenge

Coding challenges within lessons.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `lessonId` (ObjectId, Required, Foreign Key) - Reference to parent lesson
- `title` (String, Required) - Challenge title
- `starterCode` (String, Required) - Initial code template
- `solutionCode` (String, Required) - Reference solution
- `testCases` (JSON, Required) - Test cases for validation

**Relationships:**
- Belongs to: Lesson (Cascade delete)
- Has many: Submissions

### Enrollment

Links users to courses they're enrolled in.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `userId` (ObjectId, Required, Foreign Key) - Reference to user
- `courseId` (ObjectId, Required, Foreign Key) - Reference to course
- `enrolledAt` (DateTime, Auto) - Enrollment timestamp

**Relationships:**
- Belongs to: User (Cascade delete), Course (Cascade delete)

**Constraints:**
- Unique index on (userId, courseId) - Prevents duplicate enrollments

### LessonProgress

Tracks user progress through lessons.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `userId` (ObjectId, Required, Foreign Key) - Reference to user
- `lessonId` (ObjectId, Required, Foreign Key) - Reference to lesson
- `isCompleted` (Boolean, Default: false) - Completion status
- `completedAt` (DateTime, Optional) - Completion timestamp

**Relationships:**
- Belongs to: User (Cascade delete), Lesson (Cascade delete)

**Constraints:**
- Unique index on (userId, lessonId) - One progress record per user per lesson

### Submission

User code submissions for challenges.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `userId` (ObjectId, Required, Foreign Key) - Reference to user
- `challengeId` (ObjectId, Required, Foreign Key) - Reference to challenge
- `userCode` (String, Required) - User's submitted code
- `outputLog` (String, Required) - Execution output/logs
- `status` (Status Enum, Required) - Submission status
- `metrics` (JSON, Required) - Execution metrics (time, memory, etc.)
- `createdAt` (DateTime, Auto) - Submission timestamp

**Relationships:**
- Belongs to: User (Cascade delete), Challenge (Cascade delete)

**Status Enum Values:**
- `PENDING` - Awaiting execution
- `RUNNING` - Currently executing
- `PASSED` - All tests passed
- `FAILED` - One or more tests failed

### ChatThread

Conversation threads for user support and help.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `userId` (ObjectId, Required, Foreign Key) - Reference to user who created the thread
- `title` (String, Required) - Thread title/subject
- `createdAt` (DateTime, Auto) - Thread creation timestamp
- `updatedAt` (DateTime, Auto-update) - Last update timestamp

**Relationships:**
- Belongs to: User (Cascade delete)
- Has many: ChatMessages

### ChatMessage

Individual messages within chat threads.

**Fields:**
- `id` (ObjectId, Primary Key) - Unique identifier
- `threadId` (ObjectId, Required, Foreign Key) - Reference to parent thread
- `role` (SenderRole Enum, Required) - Message sender role
- `content` (String, Required) - Message content
- `createdAt` (DateTime, Auto) - Message timestamp

**Relationships:**
- Belongs to: ChatThread (Cascade delete)

**SenderRole Enum Values:**
- `USER` - Message from user
- `ASSISTANT` - Message from AI assistant
- `SYSTEM` - System-generated message

## Cascade Deletion

The following cascade deletion rules are implemented:

- Deleting a **Course** deletes all related **Lessons** and **Enrollments**
- Deleting a **Lesson** deletes all related **Challenges** and **LessonProgress**
- Deleting a **Challenge** deletes all related **Submissions**
- Deleting a **User** deletes all related **Enrollments**, **LessonProgress**, **Submissions**, **ChatThreads**
- Deleting a **ChatThread** deletes all related **ChatMessages**

## Usage

### Connecting to the Database

```typescript
import { prisma } from './utils/db'

// The connection is automatically managed
// Just use the prisma client
const users = await prisma.user.findMany()
```

### Example Queries

**Create a new user:**
```typescript
const user = await prisma.user.create({
  data: {
    email: 'student@example.com',
    passwordHash: 'hashed_password',
    role: 'STUDENT',
    profileData: { firstName: 'John', lastName: 'Doe' }
  }
})
```

**Enroll a user in a course:**
```typescript
const enrollment = await prisma.enrollment.create({
  data: {
    userId: user.id,
    courseId: course.id
  }
})
```

**Track lesson completion:**
```typescript
const progress = await prisma.lessonProgress.upsert({
  where: {
    userId_lessonId: {
      userId: user.id,
      lessonId: lesson.id
    }
  },
  update: {
    isCompleted: true,
    completedAt: new Date()
  },
  create: {
    userId: user.id,
    lessonId: lesson.id,
    isCompleted: true,
    completedAt: new Date()
  }
})
```

**Submit a challenge solution:**
```typescript
const submission = await prisma.submission.create({
  data: {
    userId: user.id,
    challengeId: challenge.id,
    userCode: 'function solution() { ... }',
    outputLog: 'All tests passed',
    status: 'PASSED',
    metrics: { executionTime: 100, memoryUsed: 1024 }
  }
})
```

## Configuration

The database connection is configured through environment variables in the `.env` file:

```
DATABASE_URL="mongodb://localhost:27017/lambda_lap"
```

For Prisma 7, the configuration is also specified in `prisma/prisma.config.ts`.

## Generating the Prisma Client

After making changes to the schema, regenerate the Prisma client:

```bash
npx prisma generate
```

## Migrations

Since this project uses MongoDB, traditional migrations are not applicable. The schema is enforced at the application level through Prisma.

To push schema changes to the database:

```bash
npx prisma db push
```

## Testing

Database schema tests are located in `src/__tests__/database.test.ts`. Run tests with:

```bash
npm test
```
