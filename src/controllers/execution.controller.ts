import { Response } from 'express'
import { Challenge, Submission } from '../models'
import { success, error } from '../utils/jsend'
import { AuthRequest } from '../middlewares/auth.middleware'

// Dummy execution configuration
const DUMMY_TEST_PASS_RATE = 0.7 // 70% pass rate for demo purposes

/**
 * Execute code (dummy implementation for now)
 */
export const runCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { challengeId, code } = req.body

    if (!code) {
      res.status(400).json(error('Code is required', 'VALIDATION_ERROR'))
      return
    }

    // Dummy execution logic
    // In production, this would integrate with a code execution service
    let status = 'PASS'
    let stdout = ''
    let stderr = null

    // Simple validation - check if code is not empty
    if (code.trim().length === 0) {
      status = 'ERROR'
      stderr = 'Empty code submission'
    } else {
      // Simulate successful execution
      stdout = 'Code executed successfully\n'

      // If there's a challengeId, validate against test cases (dummy)
      if (challengeId) {
        const challenge = await Challenge.findById(challengeId)
        if (challenge) {
          // Dummy test case validation
          // In production, this would run actual tests
          const testsPassed = Math.random() < DUMMY_TEST_PASS_RATE

          if (testsPassed) {
            status = 'PASS'
            stdout += 'All test cases passed!\n'
          } else {
            status = 'FAIL'
            stdout += 'Test case 1: Expected "Hello" but got "Hello World"\n'
          }
        }
      }
    }

    // Save submission if user is authenticated and challenge exists
    if (req.user && challengeId) {
      await Submission.create({
        userId: req.user.id,
        challengeId,
        userCode: code,
        outputLog: stdout + (stderr || ''),
        status: status === 'PASS' ? 'PASSED' : status === 'FAIL' ? 'FAILED' : 'FAILED',
        metrics: {
          runtime: `${(Math.random() * 0.1).toFixed(2)}s`,
          memoryUsed: `${Math.floor(Math.random() * 1024)}KB`
        }
      })
    }

    res.status(200).json(
      success({
        status,
        stdout,
        stderr,
        metrics: {
          runtime: `${(Math.random() * 0.1).toFixed(2)}s`
        }
      })
    )
  } catch (err) {
    console.error('Run code error:', err)
    res.status(500).json(error('Failed to execute code', 'INTERNAL_ERROR'))
  }
}

/**
 * Get submission history for a user
 */
export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    const { challengeId } = req.query

    const filter: any = { userId: req.user.id }
    if (challengeId) {
      filter.challengeId = challengeId
    }

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('challengeId')

    const submissionsData = submissions.map(sub => ({
      id: sub._id.toString(),
      challengeId: sub.challengeId.toString(),
      status: sub.status,
      createdAt: sub.createdAt,
      metrics: sub.metrics
    }))

    res.status(200).json(success(submissionsData))
  } catch (err) {
    console.error('Get submissions error:', err)
    res.status(500).json(error('Failed to get submissions', 'INTERNAL_ERROR'))
  }
}
