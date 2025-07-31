const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();
const cookieParser = require('cookie-parser');

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: ['http://localhost:5173', "http://192.168.1.149:5173", "https://velopro.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("🚲 BikeShop backend is running!");
});

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use("/api/auth/", require("./routes/authRoutes"));
app.use("/api/users/", require("./routes/userRoutes"))
app.use("/api/products/", require("./routes/productRoutes"));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api', require('./routes/reviewRoutes'));


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server работает на порту:
  ➜ Local:   http://localhost:${PORT}
  ➜ Network: http://${require('os').networkInterfaces().eth0?.[0].address || 'YOUR_IP'}:${PORT}
`);
  });
}

module.exports = app;
