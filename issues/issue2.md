Title:
Implement Leave Request Attachment Upload and Storage

Objective:

Currently attachment validation exists but uploaded files are not stored.

Implement real file upload functionality.

Requirements:

1. Attachment must remain required.

2. Supported files:

   * PDF
   * PNG
   * JPG
   * JPEG

3. Maximum size:

   * 5 MB

4. Store files using Adonis Drive.

5. Create storage structure:

uploads/leaves/

6. Generate unique filename.

7. Save file URL/path into:

leave_requests.attachment_url

8. Return attachment_url in API response.

9. Add tests:

   * successful upload
   * invalid extension
   * file too large

10. Update Swagger documentation.

Acceptance Criteria:

* File physically exists after upload.
* URL stored in database.
* URL returned in response.
* Validation works.
* Tests pass.
* Existing leave workflow still works.

Output Required:

1. Files modified
2. Storage configuration
3. Validation rules
4. Test results
5. Example upload request
