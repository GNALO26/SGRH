import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Accept': 'application/json' },
});

// Intercepteur de requête : attache le token JWT stocké dans le localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercepteur de réponse : gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si l'erreur est de validation (422), on extrait le premier message pour SweetAlert
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errors = error.response.data.errors;
      const firstField = Object.keys(errors)[0];
      const message = Array.isArray(errors[firstField]) ? errors[firstField][0] : errors[firstField];
      error.response.data.message = message;
    }
    // Si l'erreur est 401 (non authentifié), on nettoie le token et on redirige vers la page de connexion
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;