const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logout
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);

module.exports = router;
