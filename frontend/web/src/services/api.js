import axios from 'axios';

const api = axios.create({
  // O endereço onde seu backend (Node.js) está rodando
  baseURL: 'https://ecodenuncia.onrender.com/api' // Atualizando para produção
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