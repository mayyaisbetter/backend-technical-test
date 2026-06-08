/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/auth.ts
| ├── start/routes/leaves.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/auth'
| import './routes/leaves'
|
*/

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
| API v1
|--------------------------------------------------------------------------
*/
Route.group(() => {
  Route.get('/', async () => {
    return {
      message: 'Leave Management API v1',
      version: '1.0.0',
    }
  })
}).prefix('/api/v1')
