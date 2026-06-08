import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Before every request, automatically attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dqs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;