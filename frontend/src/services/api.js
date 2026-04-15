import axios from 'axios';

// In production, frontend is served from the same Express server → use relative /api
// In development, use VITE_API_URL (e.g. http://localhost:5000)
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});


// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecotrack_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
