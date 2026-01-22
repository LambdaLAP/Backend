# Backend
The Backend of Lambda L.A.P Project

## Stack
- **Node.js** with **TypeScript** (Strict mode, ES2020+)
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **Jest** & **Supertest** - Testing framework
- **ESLint** (Standard) & **Prettier** - Code quality
- **Husky** - Git hooks for pre-commit linting

## Project Structure
```
src/
├── __tests__/          # Test files
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middlewares/        # Express middlewares
├── routes/             # Route definitions
├── services/           # Business logic
├── utils/              # Utility functions
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance

### Installation
```bash
npm install
```

### Configuration
Update the `.env` file with your MongoDB connection string:
```
DATABASE_URL="mongodb+srv://..."
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## API Endpoints

**Base URL:** `http://localhost:4000/api/v1`

All API responses follow the **JSend** standard format.

### Authentication

#### `POST /auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "STUDENT"
    }
  }
}
```

#### `POST /auth/login`
Login with existing credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):** Same as register

#### `GET /auth/me`
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "STUDENT",
      "profileData": { "name": "John Doe" },
      "stats": {
        "streakDays": 3,
        "totalXp": 1250,
        "lessonsCompleted": 12
      }
    }
  }
}
```

---

### User Dashboard

#### `GET /users/dashboard`
Get user dashboard with stats and quick resume information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Doe",
      "avatar": null
    },
    "stats": {
      "streakDays": 3,
      "totalXp": 1250,
      "lessonsCompleted": 12
    },
    "quickResume": {
      "courseTitle": "Python 101",
      "lessonId": "lesson_id",
      "lessonTitle": "Loops and Logic"
    }
  }
}
```

#### `GET /users/enrollments`
Get list of user's course enrollments.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "courseId": "course_id",
      "title": "Python 101",
      "totalLessons": 20,
      "completedLessons": 5,
      "lastAccessedAt": "2025-12-10T..."
    }
  ]
}
```

#### `POST /users/enrollments`
Enroll in a course.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "courseId": "course_id"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "enrollment_id"
  }
}
```

#### `PUT /users/progress/:lessonId`
Update lesson progress.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "isCompleted": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "progress": "progress_id"
  }
}
```

---

### Courses

#### `GET /courses`
Get list of published courses with optional filters.

**Query Parameters:**
- `difficulty` (optional): BEGINNER | INTERMEDIATE | ADVANCED
- `topic` (optional): Filter by tag

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "course_id",
      "title": "Python Fundamentals",
      "description": "Master the basics...",
      "difficulty": "BEGINNER",
      "tags": ["Python", "Programming"],
      "meta": {
        "lessonCount": 12,
        "durationHours": 6
      }
    }
  ]
}
```

#### `GET /courses/:courseId`
Get details of a specific course.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "course_id",
    "title": "Python 101",
    "description": "...",
    "difficulty": "BEGINNER",
    "tags": ["Python"],
    "isPublished": true,
    "meta": {
      "lessonCount": 20,
      "durationHours": 10
    }
  }
}
```

#### `GET /courses/:courseId/syllabus`
Get course syllabus with lesson statuses (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "course_id",
      "title": "Python 101",
      "description": "..."
    },
    "userProgress": {
      "percent": 45
    },
    "lessons": [
      {
        "id": "lesson_id",
        "orderIndex": 1,
        "title": "Variables",
        "type": "LESSON",
        "status": "COMPLETED"
      },
      {
        "id": "lesson_id_2",
        "orderIndex": 2,
        "title": "Data Types",
        "type": "CHALLENGE",
        "status": "IN_PROGRESS"
      }
    ]
  }
}
```

#### `POST /courses` (Admin/Instructor only)
Create a new course.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "difficulty": "BEGINNER",
  "tags": ["Python"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "courseId": "course_id"
  }
}
```

#### `PUT /courses/:courseId` (Admin/Instructor only)
Update a course.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Updated Title",
  "isPublished": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "course_id"
  }
}
```

#### `DELETE /courses/:courseId` (Admin/Instructor only)
Delete a course.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Course deleted successfully"
  }
}
```

---

### Lessons

#### `GET /lessons/:lessonId`
Get lesson details with challenges and navigation.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "lesson_id",
    "title": "Data Types",
    "contentMarkdown": "# Introduction...",
    "challenges": [
      {
        "id": "challenge_id",
        "title": "Challenge Title",
        "starterCodes": {
          "python": "# Your code here",
          "javascript": "// Your code here",
          "cpp": "// Your code here"
        },
        "testCases": [
          {
            "input": "1, 2, 3",
            "expectedOutput": "6",
            "isHidden": false
          }
        ]
      }
    ],
    "nextLessonId": "next_lesson_id",
    "prevLessonId": "prev_lesson_id"
  }
}
```

#### `GET /lessons/course/:courseId`
Get all lessons for a course.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "lesson_id",
      "title": "Variables",
      "orderIndex": 1,
      "type": "LESSON"
    }
  ]
}
```

#### `POST /lessons` (Admin/Instructor only)
Create a new lesson.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "courseId": "course_id",
  "title": "New Lesson",
  "orderIndex": 1,
  "contentMarkdown": "# Lesson content",
  "type": "LESSON"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "lessonId": "lesson_id"
  }
}
```

---

### Challenges

#### `GET /challenges/:challengeId`
Get challenge details. Hidden test cases are filtered for students.

**Headers:** `Authorization: Bearer <token>` (optional, affects test case visibility)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "challenge_id",
    "lessonId": "lesson_id",
    "title": "Two Sum Problem",
    "starterCodes": {
      "python": "def two_sum(nums, target):\n    pass",
      "javascript": "function twoSum(nums, target) {\n    // your code\n}",
      "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    // your code\n}",
      "java": "public int[] twoSum(int[] nums, int target) {\n    // your code\n}"
    },
    "testCases": [
      {
        "input": "[2, 7, 11, 15], 9",
        "expectedOutput": "[0, 1]",
        "isHidden": false
      }
    ]
  }
}
```

**Note:** Students only see test cases where `isHidden: false`. Admins/instructors see all test cases.

#### `POST /challenges` (Admin/Instructor only)
Create a new challenge with multi-language support.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "lessonId": "lesson_id",
  "title": "Two Sum Problem",
  "starterCodes": {
    "python": "def two_sum(nums, target):\n    pass",
    "javascript": "function twoSum(nums, target) {\n    // your code\n}",
    "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    // your code\n}"
  },
  "solutionCodes": {
    "python": "def two_sum(nums, target):\n    # solution"
  },
  "testCases": [
  "testCases": [
    {
      "input": "[2, 7, 11, 15], 9",
      "expectedOutput": "[0, 1]",
      "isHidden": false
    },
    {
      "input": "[3, 2, 4], 6",
      "expectedOutput": "[1, 2]",
      "isHidden": true
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "challengeId": "challenge_id"
  }
}
```

**Supported Languages:** `python`, `cpp`, `java`, `javascript`, `typescript`, `go`, `rust`

---

### Code Execution & Submissions

#### `POST /execution/run`
Quickly test code without saving (dummy implementation).

**Headers:** `Authorization: Bearer <token>` (optional)

**Request:**
```json
{
  "challengeId": "challenge_id",
  "code": "def two_sum(nums, target):\n    return [0, 1]",
  "language": "python"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "PASS",
    "stdout": "Code executed successfully\nAll test cases passed!\n",
    "stderr": null,
    "metrics": {
      "runtime": "0.02s"
    }
  }
}
```

**Supported Languages:** `python`, `cpp`, `java`, `javascript`, `typescript`, `go`, `rust`

**Note:** Use this endpoint for quick testing. For official challenge submissions, use `/execution/submit`.

#### `POST /execution/submit`
Submit code for a challenge. Validates, executes, saves submission, and returns results.

**Headers:** `Authorization: Bearer <token>` (required)

**Request:**
```json
{
  "challengeId": "challenge_id",
  "code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i",
  "language": "python"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission_id",
    "status": "PASSED",
    "stdout": "Code executed successfully\nAll test cases passed!\n",
    "stderr": null,
    "metrics": {
      "runtime": "0.03s",
      "memoryUsed": "512KB"
    }
  }
}
```

**Supported Languages:** `python`, `cpp`, `java`, `javascript`, `typescript`, `go`, `rust`

**Features:**
- Requires authentication
- Validates that the challenge supports the selected language
- Executes the code against test cases
- Saves the submission to the database
- Returns the submission ID for tracking

#### `GET /execution/submissions`
Get submission history with language information.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `challengeId` (optional): Filter by challenge

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "submission_id",
      "challengeId": "challenge_id",
      "language": "python",
      "status": "PASSED",
      "createdAt": "2025-12-10T...",
      "metrics": {
        "runtime": "0.02s",
        "memoryUsed": "512KB"
      }
    }
  ]
}
```

---

### Health Check
- **GET** `/health`
  - Returns server health status
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "status": "healthy",
        "timestamp": "2024-12-03T17:00:00.000Z"
      }
    }
    ```

## JSend Response Format
All API responses follow the JSend format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get a token by registering or logging in via `/api/v1/auth/register` or `/api/v1/auth/login`.

## Testing
Tests are written using Jest and Supertest. Run tests with:
```bash
npm test
```

## Code Quality
- **Pre-commit hooks** automatically run linting and formatting
- **ESLint** with Standard configuration
- **Prettier** for consistent code formatting
- **TypeScript strict mode** for type safety

## License
ISC
