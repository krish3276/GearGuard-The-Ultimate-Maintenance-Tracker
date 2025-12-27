import axios from 'axios';

// Backend runs on port 3000, all routes under /api prefix
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tc7nqv49-3000.inc1.devtunnels.ms/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  // POST /api/auth/login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // POST /api/auth/register
  register: (data) => api.post('/auth/register', data),
  
  // GET /api/auth/me
  getCurrentUser: () => api.get('/auth/me'),
};

// ============ EQUIPMENT API ============
export const equipmentAPI = {
  // GET /api/equipment
  getAll: (params) => api.get('/equipment', { params }),
  
  // GET /api/equipment/:id
  getById: (id) => api.get(`/equipment/${id}`),
  
  // POST /api/equipment
  create: (data) => api.post('/equipment', data),
  
  // PUT /api/equipment/:id
  update: (id, data) => api.put(`/equipment/${id}`, data),
  
  // DELETE /api/equipment/:id
  delete: (id) => api.delete(`/equipment/${id}`),
};

// ============ TEAMS API ============
export const teamsAPI = {
  // GET /api/teams
  getAll: () => api.get('/teams'),
  
  // GET /api/teams/:id
  getById: (id) => api.get(`/teams/${id}`),
  
  // POST /api/teams
  create: (data) => api.post('/teams', data),
  
  // PUT /api/teams/:id
  update: (id, data) => api.put(`/teams/${id}`, data),
  
  // DELETE /api/teams/:id
  delete: (id) => api.delete(`/teams/${id}`),
  
  // GET /api/teams/:id/members
  getMembers: (id) => api.get(`/teams/${id}/members`),
  
  // POST /api/teams/:id/members
  addMember: (id, data) => api.post(`/teams/${id}/members`, data),
  
  // DELETE /api/teams/:id/members/:userId
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
};

// ============ MAINTENANCE REQUESTS API ============
export const maintenanceAPI = {
  // GET /api/requests
  getAll: (params) => api.get('/requests', { params }),
  
  // GET /api/requests/:id
  getById: (id) => api.get(`/requests/${id}`),
  
  // POST /api/requests
  create: (data) => api.post('/requests', data),
  
  // PUT /api/requests/:id
  update: (id, data) => api.put(`/requests/${id}`, data),
  
  // DELETE /api/requests/:id
  delete: (id) => api.delete(`/requests/${id}`),
  
  // PATCH /api/requests/:id/status
  updateStatus: (id, status) => api.patch(`/requests/${id}/status`, { status }),
  
  // PATCH /api/requests/:id/assign
  assignTechnician: (id, data) => api.patch(`/requests/${id}/assign`, data),
  
  // GET /api/requests/equipment/:equipmentId
  getByEquipment: (equipmentId) => api.get(`/requests/equipment/${equipmentId}`),
  
  // GET /api/requests/preventive/calendar
  getCalendarEvents: (params) => api.get('/requests/preventive/calendar', { params }),
};

// ============ USERS API ============
export const usersAPI = {
  // GET /api/users
  getAll: () => api.get('/users'),
  
  // GET /api/users/:id
  getById: (id) => api.get(`/users/${id}`),
  
  // GET /api/users/technicians
  getTechnicians: () => api.get('/users/technicians'),
  
  // POST /api/users
  create: (data) => api.post('/users', data),
  
  // PUT /api/users/:id
  update: (id, data) => api.put(`/users/${id}`, data),
  
  // DELETE /api/users/:id
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
