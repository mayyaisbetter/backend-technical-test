Title:
Create Admin Seeder for Reviewer Testing

Objective:

Allow reviewers to immediately test admin functionality.

Requirements:

Create database seeder:

database/seeders/AdminSeeder.ts

Seed user:

Email:
[admin@example.com](mailto:admin@example.com)

Password:
admin123

Role:
admin

Leave Balance:
12

Password must be hashed.

Update README with:

node ace db:seed

instructions.

Acceptance Criteria:

* Seeder runs successfully.
* Admin account created.
* Admin can approve/reject leave requests.
* README updated.

Output Required:

1. Seeder code
2. Seed execution result
3. README section added
