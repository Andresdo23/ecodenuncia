const request = require('supertest');
// Nota: Idealmente, deveríamos exportar o 'app' do index.js sem o 'app.listen'.
// Para este teste simples, vamos assumir que a API está rodando ou testar a URL direta.

const API_URL = 'http://localhost:3001'; // Ou a sua URL do Render

describe('Testes Básicos da API EcoDenúncia', () => {

  test('GET /api/health deve retornar status 200', async () => {
    // Este teste verifica se o servidor está no ar
    const response = await request(API_URL).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'API está funcional!');
  });

  test('POST /api/auth/login deve falhar com credenciais vazias', async () => {
    const response = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: '',
        senha: ''
      });
    expect(response.statusCode).toBe(400); // Bad Request
  });

  test('GET /api/denuncias sem token deve retornar 401 (Unauthorized)', async () => {
    // Tenta acessar uma rota protegida sem enviar o cabeçalho Authorization
    const response = await request(API_URL).get('/api/denuncias');
    
    // Esperamos que a API recuse e retorne erro 401
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

});