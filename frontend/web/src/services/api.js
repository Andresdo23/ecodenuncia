import axios from 'axios';

const api = axios.create({
  // O endereço onde seu backend (Node.js) está rodando
  baseURL: 'http://localhost:3001/api' 
});

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