const request = require('supertest');

const API_URL = 'http://localhost:3001';

describe('Testes Básicos da API EcoDenúncia', () => {

  test('GET /api/health deve retornar status 200', async () => {
    const response = await request(API_URL).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'API está funcional!');
  });

  test('POST /api/auth/login deve falhar com credenciais vazias', async () => {
    const response = await request(API_URL)
      .post('/api/auth/login')
      .send({ email: '', senha: '' });
      
    expect(response.statusCode).toBe(400);
  });

  test('GET /api/denuncias sem token deve retornar 401 (Unauthorized)', async () => {
    const response = await request(API_URL).get('/api/denuncias');
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

});