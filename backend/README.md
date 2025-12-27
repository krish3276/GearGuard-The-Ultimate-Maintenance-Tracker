# GearGuard Backend

A production-ready REST API backend for the GearGuard Maintenance Management System.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file from template:

```bash
cp .env.example .env
```

3. Configure your database credentials in `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gearguard
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

4. Create the PostgreSQL database:

```sql
CREATE DATABASE gearguard;
```

5. Start the development server:

```bash
npm run dev
```

The server will automatically sync the database schema on startup.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/technicians` - List technicians

### Maintenance Teams

- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member

### Equipment

- `GET /api/equipment` - List all equipment
- `GET /api/equipment/:id` - Get equipment by ID
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Maintenance Requests

- `GET /api/requests` - List all requests
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `GET /api/requests/equipment/:equipmentId` - Get by equipment
- `GET /api/requests/preventive/calendar?start_date=&end_date=` - Calendar view
- `PATCH /api/requests/:id/status` - Update status
- `PATCH /api/requests/:id/assign` - Assign technician

## Business Logic

1. **Request Creation**: Auto-fetches maintenance team from selected equipment
2. **Technician Assignment**: Validates technician belongs to the request's maintenance team
3. **Status Workflow**: New → In Progress → Repaired (or Scrap)
4. **Scrap Status**: Automatically marks equipment as scrapped
5. **Preventive Requests**: Requires scheduled_date, queryable for calendar

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run db:sync` - Sync database schema
