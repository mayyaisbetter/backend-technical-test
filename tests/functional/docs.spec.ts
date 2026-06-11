import { test } from '@japa/runner'

test.group('Docs Functional Tests', () => {
  test('swagger json and ui endpoints are accessible', async ({ client }) => {
    const specResponse = await client.get('/api/v1/swagger.json')

    specResponse.assertStatus(200)
    const specBody = specResponse.body()
    if (specBody.openapi !== '3.0.3') {
      throw new Error('Swagger spec is missing the expected OpenAPI version')
    }
    if (!specBody.paths?.['/api/v1/auth/login'] || !specBody.paths?.['/api/v1/leaves']) {
      throw new Error('Swagger spec is missing required paths')
    }

    const docsResponse = await client.get('/api/v1/docs')

    docsResponse.assertStatus(200)
    const text = docsResponse.text()
    if (!text.includes('SwaggerUIBundle')) {
      throw new Error('Response missing SwaggerUIBundle')
    }
    if (!text.includes('/api/v1/swagger.json')) {
      throw new Error('Response missing /api/v1/swagger.json')
    }
  })
})
