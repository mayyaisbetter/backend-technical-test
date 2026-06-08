import Route from '@ioc:Adonis/Core/Route'

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
Route.get('/health', async ({ response }) => {
  return response.ok({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'leave-management-api',
  })
})

/*
|--------------------------------------------------------------------------
| API v1 Route Group
|--------------------------------------------------------------------------
*/
Route.group(() => {
  // Public Auth Routes
  Route.post('/auth/register', 'AuthController.register')
  Route.post('/auth/login', 'AuthController.login')

  // Authenticated Route Group
  Route.group(() => {
    // Current User Profile
    Route.get('/users/me', 'AuthController.me')

    // General Leave Request List & Details
    Route.get('/leaves', 'LeaveController.index')
    Route.get('/leaves/:id', 'LeaveController.show')

    // Employee Specific Endpoints (Only 'employee' role can apply/cancel cuti)
    Route.group(() => {
      Route.post('/leaves', 'LeaveController.create')
      Route.patch('/leaves/:id/cancel', 'LeaveController.cancel')
    }).middleware('role:employee')

    // Admin Specific Endpoints (Only 'admin' role can approve/reject cuti)
    Route.group(() => {
      Route.patch('/leaves/:id/approve', 'ApprovalController.approve')
      Route.patch('/leaves/:id/reject', 'ApprovalController.reject')
    }).middleware('role:admin')

  }).middleware('jwtAuth')

}).prefix('/api/v1')
