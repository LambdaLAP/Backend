import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { User, Role } from '../models/User'
import { Course, Difficulty } from '../models/Course'
import { Lesson, LessonType } from '../models/Lesson'
import { Challenge } from '../models/Challenge'
import { Enrollment } from '../models/Enrollment'
import { LessonProgress } from '../models/LessonProgress'

dotenv.config()

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/lambda-lap'

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Challenge.deleteMany({}),
      Enrollment.deleteMany({}),
      LessonProgress.deleteMany({})
    ])
    console.log('Cleared existing data')

    // 1. Create Users
    const passwordHash = await bcrypt.hash('password123', 10)

    await User.create({
      email: 'admin@lambda.com',
      passwordHash,
      role: Role.ADMIN,
      profileData: { name: 'Admin User' }
    })

    await User.create({
      email: 'instructor@lambda.com',
      passwordHash,
      role: Role.INSTRUCTOR,
      profileData: { name: 'Instructor User' }
    })

    const students = []
    for (let i = 1; i <= 10; i++) {
      const student = await User.create({
        email: `student${i}@lambda.com`,
        passwordHash,
        role: Role.STUDENT,
        profileData: { name: `Student ${i}` }
      })
      students.push(student)
    }

    console.log('Created Users: Admin, Instructor, and 10 Students')

    // 2. Create Courses
    const pythonCourse = await Course.create({
      title: 'Python Fundamentals',
      description: 'Learn the basics of Python programming, from variables to loops.',
      difficulty: Difficulty.BEGINNER,
      tags: ['Python', 'Programming'],
      isPublished: true
    })

    const jsCourse = await Course.create({
      title: 'Advanced JavaScript Patterns',
      description: 'Master closures, prototypes, and async programming.',
      difficulty: Difficulty.ADVANCED,
      tags: ['JavaScript', 'Web'],
      isPublished: true
    })

    await Course.create({
      title: 'Draft Course - WIP',
      description: 'This course is currently being developed.',
      difficulty: Difficulty.INTERMEDIATE,
      tags: ['WIP'],
      isPublished: false
    })

    console.log('Created Courses')

    // 3. Create Lessons for Python Course
    const lesson1 = await Lesson.create({
      courseId: pythonCourse._id,
      title: 'Variables & Data Types',
      orderIndex: 1,
      contentMarkdown: '# Variables\nIn Python, variables are...',
      type: LessonType.LESSON
    })

    const lesson2 = await Lesson.create({
      courseId: pythonCourse._id,
      title: 'Basic Math',
      orderIndex: 2,
      contentMarkdown: '# Math\nPython supports basic math operations...',
      type: LessonType.CHALLENGE
    })

    // Create Lessons for JS Course
    await Lesson.create({
      courseId: jsCourse._id,
      title: 'Closures',
      orderIndex: 1,
      contentMarkdown: '# Closures\nA closure is...',
      type: LessonType.LESSON
    })

    console.log('Created Lessons')

    // 4. Create Challenge for Lesson 2
    await Challenge.create({
      lessonId: lesson2._id,
      title: 'Calculate Area',
      starterCode: 'def calculate_area(length, width):\n    # Your code here\n    pass',
      solutionCode: 'def calculate_area(length, width):\n    return length * width',
      testCases: [
        { input: [5, 2], expected: 10 },
        { input: [10, 10], expected: 100 }
      ],
      language: 'python'
    })

    console.log('Created Challenges')

    // 5. Create Enrollments and Progress
    // Student 1 enrolled in Python and completed Lesson 1
    const student1 = students[0]
    await Enrollment.create({
      userId: student1._id,
      courseId: pythonCourse._id
    })

    await LessonProgress.create({
      userId: student1._id,
      lessonId: lesson1._id,
      isCompleted: true,
      completedAt: new Date()
    })

    // Student 2 enrolled in Python (no progress)
    const student2 = students[1]
    await Enrollment.create({
      userId: student2._id,
      courseId: pythonCourse._id
    })

    console.log('Created Enrollments & Progress')
    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seedDatabase()
