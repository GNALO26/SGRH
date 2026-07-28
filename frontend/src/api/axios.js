import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422 && error.response.data?.errors) {
      error.response.data.fieldErrors = error.response.data.errors;
      const firstField = Object.keys(error.response.data.errors)[0];
      error.response.data.message = Array.isArray(error.response.data.errors[firstField])
        ? error.response.data.errors[firstField][0]
        : error.response.data.errors[firstField];
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;