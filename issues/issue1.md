Title:
Implement Google OAuth Authentication Using Adonis Ally

Objective:
Implement OAuth authentication using Adonis Ally to satisfy the technical test requirement:

"Wajib mengimplementasikan login menggunakan OAuth dan login konvensional."

Requirements:

1. Install and configure Adonis Ally.

2. Configure Google OAuth provider.

3. Add required environment variables:

   * GOOGLE_CLIENT_ID
   * GOOGLE_CLIENT_SECRET
   * GOOGLE_CALLBACK_URL

4. Create OAuth endpoints:

GET /api/v1/auth/google/redirect

GET /api/v1/auth/google/callback

5. Callback behavior:

If email already exists:

* Link Google account to existing user.

If email does not exist:

* Create new employee account.

6. Generate JWT token after successful OAuth login.

7. Response format:

{
"success": true,
"message": "OAuth login successful",
"token": "...",
"user": {}
}

8. Save:

   * oauth_provider
   * oauth_id

inside users table.

9. Add unit and functional tests.

10. Update Swagger documentation.

Acceptance Criteria:

* User can login via Google.
* Existing accounts can be linked.
* JWT is returned.
* Tests pass.
* Swagger updated.
* Existing auth flow remains unchanged.

Output Required:

1. Files modified
2. Migration changes (if needed)
3. Test results
4. Swagger updates
5. Example request/response
