const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

jest.setTimeout(20000); // Увеличиваем таймаут для Atlas

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);

  // Убедимся, что подключение прошло, перед dropDatabase
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});
