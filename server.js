const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚲 BikeShop backend is running!");
});

app.use("/api/auth/", require("./routes/authRoutes"));
app.use("/api/users/", require("./routes/userRoutes"))

app.listen(PORT, () => {
  console.log(`Server работает на порту \n\thttp://localhost:${PORT}`);
});
