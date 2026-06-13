# Postman API Documentation

This directory contains the Postman Collection exported from the OpenAPI spec.

## Files

| File | Description |
|------|-------------|
| `leave-management-api.postman_collection.json` | Postman v2.1 collection generated from `swagger.json` |
| `leave-management-api.local.postman_environment.json` | Local environment (`baseUrl=http://localhost:3333`, `token=<jwt>`) |

## Import Instructions

1. Open Postman → **Import** → drag & drop both JSON files
2. Select the **Leave Management API - Local** environment (top-right dropdown)
3. Run **POST /auth/login** → copy `data.token` from response
4. Set the `token` environment variable
5. All protected endpoints use `Authorization: Bearer {{token}}`

## Endpoints Included

| Folder | Endpoints |
|---|---|
| **Auth** | Register, Login, Get Google OAuth redirect, Google OAuth callback |
| **Users** | Get current user profile (`/users/me`) |
| **Leaves** | List, Get by id, Create, Cancel, Approve (admin), Reject (admin) |

## Regenerate Collection

The collection is auto-generated from `swagger.json`:

```bash
# From project root
mkdir -p postman
node -e "
const Converter = require('openapi-to-postmanv2');
const fs = require('fs');
const swaggerData = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
Converter.convert({ type: 'json', data: swaggerData }, {}, (err, result) => {
  if (!result.result) { console.error(result.reason); process.exit(1); }
  fs.writeFileSync('postman/leave-management-api.postman_collection.json', JSON.stringify(result.output[0].data, null, 2));
  console.log('OK');
});
"
```

## Publishing Documentation

This project does not auto-publish to Postman cloud (requires Postman account + API key).

**To publish manually:**

1. Open Postman → **Import** the collection file
2. Click on the collection → **View documentation** (book icon in right sidebar)
3. Click **Publish** → choose workspace → set visibility (Public recommended)
4. Copy the published documentation URL
5. Update the URL in `README.md` under the **Postman Documentation** section

**Environment variables (when publishing via API):**

```bash
POSTMAN_API_KEY=<your-postman-api-key>
POSTMAN_COLLECTION_UID=<collection-uid-from-postman>
```

See [Postman API docs](https://learning.postman.com/docs/developer/intro-api/) for programmatic publishing.
