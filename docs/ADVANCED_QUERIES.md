# Advanced Query Capabilities

This document describes the advanced querying capabilities available in the Lambda LAP API.

## Overview

The API supports advanced filtering, sorting, pagination, and aggregation through various endpoints. These capabilities allow the frontend to perform complex queries without requiring multiple round trips.

## Query Parameters

### Pagination

Most list endpoints support pagination:

```
GET /api/v1/courses?page=1&perPage=20
```

- `page`: Page number (1-based)
- `perPage`: Number of items per page (default: 20, max: 100)

### Filtering

Filter endpoints support multiple filter types:

#### Equality Filters
```
GET /api/v1/courses?difficulty=BEGINNER&isPublished=true
```

#### Array Filters (Tags)
```
GET /api/v1/courses?topic=Python
```
Matches courses where `tags` array contains "Python"

#### Date Range Filters
```
GET /api/v1/users/enrollments?since=2025-01-01
```

### Sorting

Sort results using the `sort` and `order` parameters:

```
GET /api/v1/courses?sort=createdAt&order=desc
```

Common sort fields:
- `createdAt` - Creation date
- `title` - Alphabetical
- `difficulty` - Difficulty level
- `enrollmentCount` - Number of enrollments (courses)

## Advanced Queries

### Course Statistics with Enrollments

Get courses with enrollment counts and completion rates:

```
GET /api/v1/courses/stats
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "courseId": "course_id",
      "title": "Python 101",
      "enrollmentCount": 150,
      "averageCompletionRate": 0.65,
      "totalLessons": 20,
      "difficulty": "BEGINNER"
    }
  ]
}
```

### User Progress Across Courses

Get detailed progress for a user across all courses:

```
GET /api/v1/users/progress/detailed
```

Response:
```json
{
  "success": true,
  "data": {
    "totalCoursesEnrolled": 3,
    "totalCoursesCompleted": 1,
    "totalLessonsCompleted": 45,
    "totalXp": 2250,
    "courses": [
      {
        "courseId": "course_id",
        "courseTitle": "Python 101",
        "progress": {
          "completedLessons": 18,
          "totalLessons": 20,
          "percentage": 90
        },
        "lastAccessedAt": "2025-12-10T..."
      }
    ]
  }
}
```

### Lesson Progress with Details

Get lessons for a course with user progress and challenges:

```
GET /api/v1/courses/:courseId/lessons/detailed
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "lessonId": "lesson_id",
      "title": "Variables",
      "orderIndex": 1,
      "type": "LESSON",
      "isCompleted": true,
      "completedAt": "2025-12-08T...",
      "hasChallenge": true,
      "challengeStatus": "PASSED",
      "xpEarned": 50
    }
  ]
}
```

### Search Courses

Search courses by title, description, or tags:

```
GET /api/v1/courses/search?q=python&difficulty=BEGINNER
```

Response:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "courseId": "course_id",
        "title": "Python Fundamentals",
        "description": "...",
        "matchScore": 0.95,
        "tags": ["Python", "Programming"]
      }
    ],
    "total": 1,
    "page": 1,
    "perPage": 20
  }
}
```

### Leaderboard

Get top users by XP or completion rate:

```
GET /api/v1/users/leaderboard?sortBy=xp&limit=10
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "user_id",
      "name": "John Doe",
      "totalXp": 5000,
      "lessonsCompleted": 100,
      "coursesCompleted": 5
    }
  ]
}
```

## Aggregation Queries

### Course Completion Metrics

Get aggregated completion metrics for courses:

```
GET /api/v1/analytics/courses/completion
```

Response:
```json
{
  "success": true,
  "data": {
    "totalCourses": 10,
    "totalEnrollments": 500,
    "averageCompletionRate": 0.45,
    "completionByDifficulty": {
      "BEGINNER": 0.65,
      "INTERMEDIATE": 0.45,
      "ADVANCED": 0.25
    }
  }
}
```

### User Engagement Metrics

Get user engagement statistics:

```
GET /api/v1/analytics/users/engagement
```

Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "activeUsers": 450,
    "averageXpPerUser": 1250,
    "averageLessonsPerUser": 25,
    "streakDistribution": {
      "0-7": 300,
      "8-14": 100,
      "15-30": 50,
      "30+": 50
    }
  }
}
```

## Joins and Populated Data

### Enrollments with Course and Progress Details

The API automatically populates related data in many endpoints. For example:

```
GET /api/v1/users/enrollments
```

Automatically includes course details and progress:
- Course information (title, description, etc.)
- Progress statistics (completed lessons, total lessons)
- Last accessed timestamp

### Submissions with Challenge Details

```
GET /api/v1/execution/submissions?challengeId=challenge_id
```

Includes:
- Challenge information
- User code
- Execution results
- Timestamps

## Performance Considerations

1. **Pagination**: Always use pagination for large datasets
2. **Selective Fields**: Future versions will support field selection (`?fields=title,description`)
3. **Caching**: Results are cached where appropriate (course lists, public data)
4. **Rate Limiting**: API is rate-limited to 100 requests per minute per user

## Examples

### Get all beginner Python courses sorted by enrollment
```
GET /api/v1/courses?difficulty=BEGINNER&topic=Python&sort=enrollmentCount&order=desc
```

### Get user's incomplete lessons
```
GET /api/v1/users/progress?status=incomplete
```

### Get recent submissions for a challenge
```
GET /api/v1/execution/submissions?challengeId=challenge_id&limit=5&sort=createdAt&order=desc
```

## Future Enhancements

Planned query capabilities:
- GraphQL endpoint for flexible queries
- Real-time subscriptions for progress updates
- Advanced search with fuzzy matching
- Recommendation engine for course suggestions
