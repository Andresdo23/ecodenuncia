import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ecodenuncia.onrender.com/api'
});

// Interceptor para adicionar o token de autenticação automaticamente
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;