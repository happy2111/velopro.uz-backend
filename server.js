const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚲 BikeShop backend is running!");
});

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use("/api/auth/", require("./routes/authRoutes"));
app.use("/api/users/", require("./routes/userRoutes"))
app.use("/api/products/", require("./routes/productRoutes"));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));



if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server работает на порту \n\thttp://localhost:${PORT}`);
  });
}

module.exports = app;
