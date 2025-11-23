import axios from 'axios';

// ---
// CORREÇÃO: URL FIXA DE PRODUÇÃO
// Removemos a lógica de ambiente para garantir que ele NUNCA use localhost
// ---
const api = axios.create({
  baseURL: 'https://ecodenuncia.onrender.com/api'
});

// Interceptor para adicionar o token (mantém o login funcionando)
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;