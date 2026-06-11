import Route from '@ioc:Adonis/Core/Route'
import { readFileSync } from 'fs'
import { join } from 'path'

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
  Route.get('/swagger.json', async ({ response }) => {
    const swaggerPath = join(process.cwd(), 'swagger.json')
    const spec = JSON.parse(readFileSync(swaggerPath, 'utf8'))

    return response.ok(spec)
  })

  Route.get('/docs', async ({ response }) => {
    const swaggerUiPath = join(process.cwd(), 'node_modules/swagger-ui-dist')
    const swaggerCss = readFileSync(join(swaggerUiPath, 'swagger-ui.css'), 'utf8')
    const swaggerBundle = readFileSync(join(swaggerUiPath, 'swagger-ui-bundle.js'), 'utf8')
    const swaggerPreset = readFileSync(join(swaggerUiPath, 'swagger-ui-standalone-preset.js'), 'utf8')

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Leave Management API Docs</title>
    <style>
${swaggerCss}
      html, body { margin: 0; padding: 0; height: 100%; }
      #swagger-ui { min-height: 100%; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script>
${swaggerBundle}
    </script>
    <script>
${swaggerPreset}
    </script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/v1/swagger.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
        })
      }
    </script>
  </body>
</html>`

    return response.type('html').send(html)
  })

  // Public auth routes
  Route.post('/auth/register', 'AuthController.register').middleware('rateLimit')
  Route.post('/auth/login', 'AuthController.login').middleware('rateLimit')

  // Authenticated routes – requires valid JWT
  Route.group(() => {
    Route.get('/users/me', 'AuthController.me')

    Route.get('/leaves', 'LeaveController.index')
    Route.get('/leaves/:id', 'LeaveController.show')

    // Employee-only: create and cancel own leaves
    Route.group(() => {
      Route.post('/leaves', 'LeaveController.create')
      Route.patch('/leaves/:id/cancel', 'LeaveController.cancel')
    }).middleware('role:employee')

    // Admin-only: approve and reject leaves
    Route.group(() => {
      Route.patch('/leaves/:id/approve', 'ApprovalController.approve')
      Route.patch('/leaves/:id/reject', 'ApprovalController.reject')
    }).middleware('role:admin')
  }).middleware('jwtAuth')
}).prefix('/api/v1')
