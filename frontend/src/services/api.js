import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Equipment API
export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  getMaintenanceRequests: (id) => api.get(`/equipment/${id}/maintenance-requests`),
};

// Teams API
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  getTechnicians: (id) => api.get(`/teams/${id}/technicians`),
};

// Maintenance Requests API
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance-requests', { params }),
  getById: (id) => api.get(`/maintenance-requests/${id}`),
  create: (data) => api.post('/maintenance-requests', data),
  update: (id, data) => api.put(`/maintenance-requests/${id}`, data),
  updateStatus: (id, status) => api.patch(`/maintenance-requests/${id}/status`, { status }),
  delete: (id) => api.delete(`/maintenance-requests/${id}`),
  getByEquipment: (equipmentId) => api.get(`/maintenance-requests/equipment/${equipmentId}`),
  getCalendarEvents: (params) => api.get('/maintenance-requests/calendar', { params }),
};

// Technicians API
export const techniciansAPI = {
  getAll: () => api.get('/technicians'),
  getById: (id) => api.get(`/technicians/${id}`),
};

export default api;
