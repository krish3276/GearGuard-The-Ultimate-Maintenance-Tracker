require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration - allow all origins in development
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GearGuard API - Maintenance Management System',
    version: '1.0.0',
    documentation: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user (requires auth)'
      },
      users: {
        'GET /api/users': 'List all users',
        'GET /api/users/technicians': 'List technicians only',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user'
      },
      teams: {
        'GET /api/teams': 'List all teams',
        'GET /api/teams/:id': 'Get team by ID',
        'POST /api/teams': 'Create team',
        'PUT /api/teams/:id': 'Update team',
        'DELETE /api/teams/:id': 'Delete team',
        'GET /api/teams/:id/members': 'Get team members',
        'POST /api/teams/:id/members': 'Add member to team',
        'DELETE /api/teams/:id/members/:userId': 'Remove member'
      },
      equipment: {
        'GET /api/equipment': 'List all equipment',
        'GET /api/equipment/:id': 'Get equipment by ID',
        'POST /api/equipment': 'Create equipment',
        'PUT /api/equipment/:id': 'Update equipment',
        'DELETE /api/equipment/:id': 'Delete equipment'
      },
      requests: {
        'GET /api/requests': 'List all maintenance requests',
        'GET /api/requests/:id': 'Get request by ID',
        'POST /api/requests': 'Create request',
        'PUT /api/requests/:id': 'Update request',
        'DELETE /api/requests/:id': 'Delete request',
        'GET /api/requests/equipment/:equipmentId': 'Get requests by equipment',
        'GET /api/requests/preventive/calendar': 'Get calendar events (optional: start_date, end_date)',
        'PATCH /api/requests/:id/status': 'Update request status',
        'PATCH /api/requests/:id/assign': 'Assign technician to request'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;