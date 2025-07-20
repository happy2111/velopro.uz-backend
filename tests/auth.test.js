const request = require('supertest');
const app = require('../server'); // путь к express-приложению
const mongoose = require('mongoose');

describe('Auth Routes', () => {
  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'TestUser',
        phone: '+998901112233',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should login an existing user', async () => {
    // Сначала регистрируем
    await request(app).post('/api/auth/register').send({
      username: 'TestUser',
      phone: '+998901112233',
      email: 'test@example.com',
      password: 'password123'
    });

    // Потом логинимся
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        login: '+998901112233',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
