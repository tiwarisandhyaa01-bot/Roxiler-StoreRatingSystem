const express = require("express");

const {
  getOwnerDashboard,
} = require("./owner.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("STORE_OWNER"),
  getOwnerDashboard
);

module.exports = router;
