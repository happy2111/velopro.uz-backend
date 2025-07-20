const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Product API', () => {
  let token;

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();

    // Регистрируем пользователя
    await request(app).post('/api/auth/register').send({
      username: 'ProductUser',
      phone: '+998911223344',
      email: 'product@example.com',
      password: 'password123',
    });

    // Обновляем роль
    await User.updateOne({ email: 'product@example.com' }, { role: 'admin' });

    // Получаем токен заново (с обновлённой ролью)
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'product@example.com',
      password: 'password123',
    });

    token = loginRes.body.accessToken;
  });

  it('должен создать товар', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Велосипед',
        type: 'горный',
        price: 999
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Велосипед');
  });
});
