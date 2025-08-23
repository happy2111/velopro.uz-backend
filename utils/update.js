// Импорт MongoClient
const { MongoClient } = require("mongodb");

// Твой connection string из MongoDB Atlas
const uri = "mongodb+srv://Proxy:updown2Oo@cluster0.v5oguf7.mongodb.net/test2?retryWrites=true&w=majority&appName=Cluster0";

// Создаём клиента
const client = new MongoClient(uri);

async function run() {
  try {
    // Подключение
    await client.connect();

    // Выбираем базу и коллекцию
    const db = client.db("test2");
    const products = db.collection("products");

    // Обновление документов
    const result = await products.updateMany(
      { category: { $exists: false } }, // фильтр: нет поля category
      { $set: { category: "bike" } }     // добавим category
    );

    console.log(`Обновлено документов: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    // Закрываем соединение
    await client.close();
  }
}

run();
