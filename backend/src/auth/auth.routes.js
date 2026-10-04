const express = require("express");
const {
  register,
  login,
  changePassword,
} = require("./auth.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.put("/change-password", authenticateToken, changePassword);

module.exports = router;