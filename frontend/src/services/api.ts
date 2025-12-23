import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const csrf = localStorage.getItem('csrfToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (csrf) {
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

export default api;
