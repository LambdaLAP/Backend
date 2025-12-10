import { Role, Status, SenderRole } from '../generated/prisma'

describe('Database Schema Validation', () => {
  describe('Enums', () => {
    it('should have Role enum with correct values', () => {
      expect(Role.STUDENT).toBe('STUDENT')
      expect(Role.INSTRUCTOR).toBe('INSTRUCTOR')
      expect(Role.ADMIN).toBe('ADMIN')
    })

    it('should have Status enum with correct values', () => {
      expect(Status.PENDING).toBe('PENDING')
      expect(Status.RUNNING).toBe('RUNNING')
      expect(Status.PASSED).toBe('PASSED')
      expect(Status.FAILED).toBe('FAILED')
    })

    it('should have SenderRole enum with correct values', () => {
      expect(SenderRole.USER).toBe('USER')
      expect(SenderRole.ASSISTANT).toBe('ASSISTANT')
      expect(SenderRole.SYSTEM).toBe('SYSTEM')
    })
  })

  describe('Type Exports', () => {
    it('should export Prisma Client types', () => {
      // This test ensures the generated types are available
      const roleTypes: Role[] = [Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN]
      expect(roleTypes).toHaveLength(3)

      const statusTypes: Status[] = [Status.PENDING, Status.RUNNING, Status.PASSED, Status.FAILED]
      expect(statusTypes).toHaveLength(4)

      const senderRoleTypes: SenderRole[] = [
        SenderRole.USER,
        SenderRole.ASSISTANT,
        SenderRole.SYSTEM
      ]
      expect(senderRoleTypes).toHaveLength(3)
    })
  })
})
