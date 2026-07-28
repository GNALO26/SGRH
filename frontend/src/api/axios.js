import axios from 'axios';

const api = axios.create({
  // URL de ton API hébergée sur Render
  baseURL: process.env.REACT_APP_API_URL || 'https://sgrh-x7a8.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour insérer automatiquement le token Sanctum (Bearer Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;