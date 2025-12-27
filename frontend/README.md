# GearGuard - Maintenance Management System

A modern, professional frontend for managing equipment maintenance built with React, Vite, and Tailwind CSS.

## Features

### 🔐 Authentication
- Clean login page with form validation
- Protected routes with authentication context
- Persistent session management

### 🔧 Equipment Management
- Equipment list with search and filters
- Detailed equipment view with specifications
- Add, edit, and delete equipment
- **Smart Maintenance Button** - Shows count of open requests per equipment

### 👥 Maintenance Teams
- Team management with color coding
- Add/remove technicians from teams
- Specialization tracking for technicians

### 📋 Maintenance Requests (Core Feature)
- **Kanban Board** with drag-and-drop functionality
  - Columns: New → In Progress → Repaired → Scrap
  - Visual overdue indicators
  - Priority badges
- List view with sortable table
- Request types: Corrective & Preventive
- Auto-fill team when equipment is selected
- Duration tracking for completed work

### 📅 Calendar View
- Monthly calendar with scheduled maintenance
- Color-coded by priority
- Click-to-create preventive maintenance
- Upcoming maintenance sidebar

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **Tailwind CSS 3.4** - Styling
- **React Router 7** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Demo Login
Use any email and password to log in (demo mode).

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   └── ...
│   └── layout/          # Layout components
│       ├── Sidebar.jsx
│       └── Header.jsx
├── context/
│   └── AuthContext.jsx  # Authentication state
├── data/
│   └── mockData.js      # Sample data for demo
├── hooks/
│   └── useApi.js        # API hook
├── layouts/
│   └── MainLayout.jsx   # Main app layout
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Equipment.jsx
│   ├── EquipmentDetail.jsx
│   ├── Teams.jsx
│   ├── TeamDetail.jsx
│   ├── MaintenanceRequests.jsx
│   └── Calendar.jsx
├── services/
│   └── api.js           # Axios API setup
├── utils/
│   └── helpers.js       # Utility functions
├── App.jsx
├── main.jsx
└── index.css            # Tailwind styles
```

## API Integration

The frontend is configured to connect to a REST API at `http://localhost:3000/api`. 
Update the `VITE_API_URL` environment variable to change the API endpoint.

### Expected API Endpoints

```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/equipment
GET    /api/equipment/:id
POST   /api/equipment
PUT    /api/equipment/:id
DELETE /api/equipment/:id

GET    /api/teams
GET    /api/teams/:id
POST   /api/teams
PUT    /api/teams/:id
DELETE /api/teams/:id

GET    /api/maintenance-requests
GET    /api/maintenance-requests/:id
POST   /api/maintenance-requests
PUT    /api/maintenance-requests/:id
PATCH  /api/maintenance-requests/:id/status
DELETE /api/maintenance-requests/:id

GET    /api/technicians
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Theming
Colors can be customized in `tailwind.config.js`:
- Primary color palette
- Status colors for request states
- Sidebar colors

### Adding New Features
1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add routes in `src/App.jsx`
4. Add navigation links in `src/components/layout/Sidebar.jsx`

## License

MIT License
