import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { Role } from 'App/Enums/Role'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import { file } from '@ioc:Adonis/Core/Helpers'

test.group('Leave Functional Tests', (group) => {
  let employeeToken: string
  let adminToken: string
  let adminId: number

  group.each.setup(async () => {
    await Database.rawQuery('TRUNCATE users, leave_requests RESTART IDENTITY CASCADE')

    // Create Employee user
    const empPassword = await Hash.make('password123')
    const employee = await User.create({
      name: 'Employee Test',
      email: 'employee@example.com',
      password: empPassword,
      role: Role.EMPLOYEE,
      leaveBalance: 12,
    })

    // Create Admin user
    const adminPassword = await Hash.make('admin123')
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      leaveBalance: 12,
    })
    adminId = admin.id

    // Generate tokens directly using jwt
    const secret = Env.get('JWT_SECRET')
    employeeToken = jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role },
      secret,
      { expiresIn: '24h' }
    )
    adminToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: '24h' }
    )
  })

  group.teardown(async () => {
    await Database.rawQuery('TRUNCATE users, leave_requests RESTART IDENTITY CASCADE')
  })

  test('create leave request successfully', async ({ client }) => {
    const dummyFile = await file.generatePng('1mb')

    const response = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-01',
        end_date: '2026-07-03',
        reason: 'Family event',
      })
      .file('attachment', dummyFile.contents, { filename: dummyFile.name })

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
      message: 'Leave request submitted successfully',
    })
  })

  test('fail to create leave request with end date before start date', async ({ client }) => {
    const dummyFile = await file.generatePng('1mb')

    const response = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-03',
        end_date: '2026-07-01',
        reason: 'Invalid dates test',
      })
      .file('attachment', dummyFile.contents, { filename: dummyFile.name })

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Start date must be before or equal to end date',
    })
  })

  test('fail to create leave request with insufficient leave balance', async ({ client }) => {
    const dummyFile = await file.generatePng('1mb')

    // Requesting 15 days when balance is 12 (2026-07-01 to 2026-07-15 is 15 days)
    const response = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-01',
        end_date: '2026-07-15',
        reason: 'Too long vacation',
      })
      .file('attachment', dummyFile.contents, { filename: dummyFile.name })

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Insufficient leave balance. Requested: 15 day(s), Balance: 12 day(s)',
    })
  })

  test('fail to create leave request that overlaps with an existing pending request', async ({ client }) => {
    const dummyFile1 = await file.generatePng('1mb')
    const dummyFile2 = await file.generatePng('1mb')

    // Submit first request (2026-07-01 to 2026-07-03)
    await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-01',
        end_date: '2026-07-03',
        reason: 'First request',
      })
      .file('attachment', dummyFile1.contents, { filename: dummyFile1.name })

    // Try submitting overlapping request (2026-07-02 to 2026-07-04)
    const response = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-02',
        end_date: '2026-07-04',
        reason: 'Overlapping request',
      })
      .file('attachment', dummyFile2.contents, { filename: dummyFile2.name })

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Overlapping leave request found from 2026-07-01 to 2026-07-03',
    })
  })

  test('cancel pending leave request successfully', async ({ client }) => {
    const dummyFile = await file.generatePng('1mb')

    // Create leave request
    const createRes = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-01',
        end_date: '2026-07-03',
        reason: 'Trip to cancel',
      })
      .file('attachment', dummyFile.contents, { filename: dummyFile.name })

    const leaveId = createRes.body().data.id

    // Cancel the request
    const response = await client.patch(`/api/v1/leaves/${leaveId}/cancel`)
      .bearerToken(employeeToken)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'Leave request cancelled successfully',
      data: {
        status: 'cancelled',
      },
    })
  })

  test('fail to cancel approved leave request', async ({ client }) => {
    const dummyFile = await file.generatePng('1mb')

    // Create leave request
    const createRes = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-01',
        end_date: '2026-07-03',
        reason: 'Trip to approve then cancel',
      })
      .file('attachment', dummyFile.contents, { filename: dummyFile.name })

    const leaveId = createRes.body().data.id

    // Approve the request
    await client.patch(`/api/v1/leaves/${leaveId}/approve`)
      .bearerToken(adminToken)

    // Try cancelling it
    const response = await client.patch(`/api/v1/leaves/${leaveId}/cancel`)
      .bearerToken(employeeToken)

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Cannot cancel leave request that is already approved',
    })
  })

  test('approve leave request successfully and deduct balance', async ({ client }) => {
    const dummyFile = await file.generatePng('1mb')

    // Create request (3 days: July 1, 2, 3)
    const createRes = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-01',
        end_date: '2026-07-03',
        reason: 'Trip to approve',
      })
      .file('attachment', dummyFile.contents, { filename: dummyFile.name })

    const leaveId = createRes.body().data.id

    // Approve the request
    const response = await client.patch(`/api/v1/leaves/${leaveId}/approve`)
      .bearerToken(adminToken)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'Leave request approved successfully',
      data: {
        status: 'approved',
        approved_by: adminId,
      },
    })

    // Verify employee balance deducted (12 - 3 = 9)
    const profileRes = await client.get('/api/v1/users/me')
      .bearerToken(employeeToken)
    
    profileRes.assertBodyContains({
      data: {
        leave_balance: 9,
      },
    })
  })

  test('reject leave request successfully', async ({ client }) => {
    const dummyFile = await file.generatePng('1mb')

    // Create request
    const createRes = await client.post('/api/v1/leaves')
      .bearerToken(employeeToken)
      .fields({
        start_date: '2026-07-01',
        end_date: '2026-07-03',
        reason: 'Trip to reject',
      })
      .file('attachment', dummyFile.contents, { filename: dummyFile.name })

    const leaveId = createRes.body().data.id

    // Reject the request
    const response = await client.patch(`/api/v1/leaves/${leaveId}/reject`)
      .bearerToken(adminToken)
      .json({
        rejection_reason: 'Too busy in office',
      })

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'Leave request rejected successfully',
      data: {
        status: 'rejected',
        rejection_reason: 'Too busy in office',
      },
    })
  })
})
