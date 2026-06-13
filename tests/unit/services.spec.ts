import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'
import AuthService from 'App/Services/AuthService'
import LeaveService from 'App/Services/LeaveService'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { Role } from 'App/Enums/Role'
import { DateTime } from 'luxon'

test.group('Services Unit Tests', (group) => {
  let authService: AuthService
  let leaveService: LeaveService

  group.setup(async () => {
    authService = await Application.container.make(AuthService)
    leaveService = await Application.container.make(LeaveService)
  })
  group.each.setup(async () => {
    await Database.rawQuery('TRUNCATE audit_logs, leave_requests, users RESTART IDENTITY CASCADE')
  })

  group.teardown(async () => {
    await Database.rawQuery('TRUNCATE audit_logs, leave_requests, users RESTART IDENTITY CASCADE')
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
    const isValid = user.password ? await Hash.verify(user.password, 'mypassword123') : false
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

  test('AuthService.handleOAuthLogin creates new user for unknown OAuth + unknown email', async ({ assert }) => {
    const result = await authService.handleOAuthLogin(
      'google',
      'google-id-new',
      'oauth_new@example.com',
      'OAuth New User',
    )

    assert.equal(result.user.email, 'oauth_new@example.com')
    assert.equal(result.user.name, 'OAuth New User')
    assert.equal(result.user.oauthProvider, 'google')
    assert.equal(result.user.oauthId, 'google-id-new')
    assert.isNull(result.user.password)
    assert.equal(result.user.role, Role.EMPLOYEE)
    assert.equal(result.user.leaveBalance, 12)
    assert.isTrue(result.isNewUser)
    assert.isNotNull(result.token)

    // Audit log for OAUTH_REGISTER
    const auditLog = await Database.from('audit_logs').where('action', 'OAUTH_REGISTER').first()
    assert.isNotNull(auditLog)
    assert.equal(auditLog.actor_id, result.user.id)
  })

  test('AuthService.handleOAuthLogin returns existing user for matching OAuth credentials', async ({ assert }) => {
    // First call creates user
    const first = await authService.handleOAuthLogin(
      'google',
      'google-id-returning',
      'returning@example.com',
      'Returning User',
    )

    // Second call with same OAuth creds returns same user
    const second = await authService.handleOAuthLogin(
      'google',
      'google-id-returning',
      'returning@example.com',
      'Returning User',
    )

    assert.equal(second.user.id, first.user.id)
    assert.isFalse(second.isNewUser)
    assert.isNotNull(second.token)

    // Audit log for OAUTH_LOGIN (second call)
    const loginLog = await Database.from('audit_logs').where('action', 'OAUTH_LOGIN').first()
    assert.isNotNull(loginLog)
  })

  test('AuthService.handleOAuthLogin links OAuth to existing user by email', async ({ assert }) => {
    // Register user via conventional auth first
    const conventionalUser = await authService.register({
      name: 'Linkable User',
      email: 'linkable@example.com',
      password: 'password123',
    })

    // Now OAuth login with same email but different provider+id
    const result = await authService.handleOAuthLogin(
      'google',
      'google-id-link',
      'linkable@example.com',
      'Linkable User',
    )

    assert.equal(result.user.id, conventionalUser.id)
    assert.equal(result.user.oauthProvider, 'google')
    assert.equal(result.user.oauthId, 'google-id-link')
    assert.isFalse(result.isNewUser)
    assert.isNotNull(result.token)

    // Audit log for OAUTH_ACCOUNT_LINKED
    const linkLog = await Database.from('audit_logs').where('action', 'OAUTH_ACCOUNT_LINKED').first()
    assert.isNotNull(linkLog)
    assert.equal(linkLog.actor_id, conventionalUser.id)
  })
})
