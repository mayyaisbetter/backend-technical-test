import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import AuthService from 'App/Services/AuthService'
import LeaveService from 'App/Services/LeaveService'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { Role } from 'App/Enums/Role'
import { DateTime } from 'luxon'

test.group('Services Unit Tests', (group) => {
  const authService = new AuthService()
  const leaveService = new LeaveService()

  group.each.setup(async () => {
    await Database.rawQuery('TRUNCATE users, leave_requests RESTART IDENTITY CASCADE')
  })

  group.teardown(async () => {
    await Database.rawQuery('TRUNCATE users, leave_requests RESTART IDENTITY CASCADE')
  })

  test('AuthService.register creates user and hashes password', async ({ assert }) => {
    const user = await authService.register({
      name: 'Auth Unit Test',
      email: 'auth_unit@example.com',
      password: 'mypassword123',
    })

    assert.equal(user.email, 'auth_unit@example.com')
    assert.equal(user.name, 'Auth Unit Test')
    assert.equal(user.role, Role.EMPLOYEE)
    assert.equal(user.leaveBalance, 12)
    assert.isNotNull(user.password)
    
    // Verify password is hashed correctly and works with verify
    const isValid = await Hash.verify(user.password!, 'mypassword123')
    assert.isTrue(isValid)
  })

  test('AuthService.login returns user and valid JWT token', async ({ assert }) => {
    await authService.register({
      name: 'Login Unit Test',
      email: 'login_unit@example.com',
      password: 'mypassword123',
    })

    const result = await authService.login({
      email: 'login_unit@example.com',
      password: 'mypassword123',
    })

    assert.isNotNull(result.token)
    assert.equal(result.user.email, 'login_unit@example.com')
  })

  test('LeaveService.createLeaveRequest validates and saves leave', async ({ assert }) => {
    const employee = await authService.register({
      name: 'Leave Creator Unit',
      email: 'leave_creator@example.com',
      password: 'password123',
    })

    const leave = await leaveService.createLeaveRequest(employee.id, {
      start_date: DateTime.fromISO('2026-08-01'),
      end_date: DateTime.fromISO('2026-08-03'),
      reason: 'Unit test request',
    })

    assert.equal(leave.userId, employee.id)
    assert.equal(leave.totalDays, 3)
    assert.equal(leave.reason, 'Unit test request')
    assert.equal(leave.status, 'pending')
  })

  test('LeaveService.approveLeaveRequest performs deduction correctly', async ({ assert }) => {
    const employee = await authService.register({
      name: 'Employee Unit',
      email: 'employee_unit@example.com',
      password: 'password123',
    })

    const admin = await User.create({
      name: 'Admin Unit',
      email: 'admin_unit@example.com',
      password: await Hash.make('adminpassword'),
      role: Role.ADMIN,
      leaveBalance: 12,
    })

    // Request 4 days: August 1 to August 4
    const leave = await leaveService.createLeaveRequest(employee.id, {
      start_date: DateTime.fromISO('2026-08-01'),
      end_date: DateTime.fromISO('2026-08-04'),
      reason: 'Vacation Unit',
    })

    const approvedLeave = await leaveService.approveLeaveRequest(admin.id, leave.id)

    assert.equal(approvedLeave.status, 'approved')
    assert.equal(approvedLeave.approvedBy, admin.id)

    // Re-query user to confirm balance deducted (12 - 4 = 8)
    const updatedEmployee = await User.find(employee.id)
    assert.equal(updatedEmployee?.leaveBalance, 8)
  })
})
