import axios from 'axios';

// Tenta ler a variável de ambiente do Vercel. 
// Se não existir (no seu PC), usa localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL
});

// ... (resto do código dos interceptors) ...

// MELHORIA: Interceptor para adicionar o token JWT
// Isso adiciona o token de login em TODAS as requisições
// que o app fizer, exceto no próprio login/registro.
api.interceptors.request.use(async (config) => {
  // Pega o token do localStorage (onde vamos salvá-lo após o login)
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;