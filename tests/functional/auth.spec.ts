import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Auth Functional Tests', (group) => {
  group.each.setup(async () => {
    // Truncate tables and restart IDs to isolate tests
    await Database.rawQuery('TRUNCATE audit_logs, leave_requests, users RESTART IDENTITY CASCADE')
  })

  group.teardown(async () => {
    await Database.rawQuery('TRUNCATE audit_logs, leave_requests, users RESTART IDENTITY CASCADE')
  })

  test('register employee successfully', async ({ client }) => {
    const response = await client.post('/api/v1/auth/register').json({
      name: 'Employee Test',
      email: 'employee@example.com',
      password: 'password123',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
      message: 'User registered successfully',
      data: {
        email: 'employee@example.com',
        name: 'Employee Test',
        role: 'employee',
        leave_balance: 12,
      },
    })
  })

  test('fail to register with duplicate email', async ({ client }) => {
    // Register first user
    await client.post('/api/v1/auth/register').json({
      name: 'User One',
      email: 'duplicate@example.com',
      password: 'password123',
    })

    // Try registering with same email
    const response = await client.post('/api/v1/auth/register').json({
      name: 'User Two',
      email: 'duplicate@example.com',
      password: 'password123',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      success: false,
      message: 'Validation failed',
    })
  })

  test('login successfully with correct credentials', async ({ client }) => {
    // Register the user
    await client.post('/api/v1/auth/register').json({
      name: 'Login Test',
      email: 'login@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'login@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'Login successful',
    })

    const body = response.body()
    if (!body.data.token) {
      throw new Error('Token is missing in login response')
    }

    const auditLog = await Database.from('audit_logs').where('action', 'LOGIN').first()
    if (!auditLog) {
      throw new Error('Expected LOGIN audit log to be created')
    }

    response.assertStatus(200)
  })

  test('fail to login with incorrect credentials', async ({ client }) => {
    // Register the user
    await client.post('/api/v1/auth/register').json({
      name: 'Login Test',
      email: 'login@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'login@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Invalid email or password',
    })
  })

  test('fetch profile successfully with valid token', async ({ client }) => {
    // Register and login
    await client.post('/api/v1/auth/register').json({
      name: 'Profile Test',
      email: 'profile@example.com',
      password: 'password123',
    })

    const loginRes = await client.post('/api/v1/auth/login').json({
      email: 'profile@example.com',
      password: 'password123',
    })

    const token = loginRes.body().data.token

    const response = await client.get('/api/v1/users/me').bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        email: 'profile@example.com',
        name: 'Profile Test',
      },
    })
  })

  test('fail to fetch profile without valid token', async ({ client }) => {
    const response = await client.get('/api/v1/users/me').bearerToken('invalid-token')

    response.assertStatus(401)
    response.assertBodyContains({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    })
  })
})
