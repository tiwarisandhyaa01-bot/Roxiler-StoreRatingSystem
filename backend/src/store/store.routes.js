const express = require("express");

const {
  getStores,
  submitRating,
  updateRating,
} = require("./store.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("USER"),
  getStores
);

router.post(
  "/:storeId/ratings",
  authenticateToken,
  authorizeRoles("USER"),
  submitRating
);

router.put(
  "/:storeId/ratings",
  authenticateToken,
  authorizeRoles("USER"),
  updateRating
);

module.exports = router;
