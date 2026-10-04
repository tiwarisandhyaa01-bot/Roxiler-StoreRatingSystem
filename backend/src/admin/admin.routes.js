const express = require("express");

const {
  getDashboardStats,
  createUser,
  getUsers,
  getUserById,
    createStore,
  getStores,
  getStoreById
} = require("./admin.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getDashboardStats
);

router.post(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createUser
);

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUsers
);

router.get(
  "/users/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUserById
);

router.post(
  "/stores",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createStore
);

router.get(
  "/stores",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getStores
);
router.get(
  "/stores/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getStoreById
);
module.exports = router;




