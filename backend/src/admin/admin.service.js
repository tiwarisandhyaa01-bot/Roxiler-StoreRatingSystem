const bcrypt = require("bcrypt");
const pool = require("../config/db");

const getDashboardStats = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM stores) AS total_stores,
      (SELECT COUNT(*) FROM ratings) AS total_ratings
  `);

  return result.rows[0];
};

const createUser = async ({ name, email, password, address, role }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const allowedRoles = ["USER", "ADMIN", "STORE_OWNER"];

  if (!allowedRoles.includes(role)) {
    const error = new Error("Invalid user role.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [
      name.trim(),
      normalizedEmail,
      hashedPassword,
      address.trim(),
      role,
    ]
  );

  return result.rows[0];
};

const getUsers = async ({
  name = "",
  email = "",
  address = "",
  role = "",
  sortBy = "name",
  order = "asc",
}) => {
  const allowedSortFields = {
    name: "name",
    email: "email",
    address: "address",
    role: "role",
  };

  const sortColumn = allowedSortFields[sortBy] || "name";
  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  const values = [];
  const conditions = [];

  if (name.trim()) {
    values.push(`%${name.trim()}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  if (email.trim()) {
    values.push(`%${email.trim()}%`);
    conditions.push(`email ILIKE $${values.length}`);
  }

  if (address.trim()) {
    values.push(`%${address.trim()}%`);
    conditions.push(`address ILIKE $${values.length}`);
  }

  if (role.trim()) {
    values.push(role.trim().toUpperCase());
    conditions.push(`role = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT id, name, email, address, role, created_at
     FROM users
     ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}`,
    values
  );

  return result.rows;
};


const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.address,
       u.role,
       s.id AS store_id,
       s.name AS store_name,
       COALESCE(AVG(r.rating), 0) AS rating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE u.id = $1
     GROUP BY u.id, s.id, s.name`,
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const createStore = async ({ name, email, address, ownerId }) => {
  const owner = await pool.query(
    "SELECT id, role FROM users WHERE id = $1",
    [ownerId]
  );

  if (owner.rows.length === 0) {
    const error = new Error("Store owner not found.");
    error.statusCode = 404;
    throw error;
  }

  if (owner.rows[0].role !== "STORE_OWNER") {
    const error = new Error("Selected user is not a Store Owner.");
    error.statusCode = 400;
    throw error;
  }

  const existingStore = await pool.query(
    "SELECT id FROM stores WHERE email = $1",
    [email.trim().toLowerCase()]
  );

  if (existingStore.rows.length > 0) {
    const error = new Error("A store with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const existingOwnerStore = await pool.query(
    "SELECT id FROM stores WHERE owner_id = $1",
    [ownerId]
  );

  if (existingOwnerStore.rows.length > 0) {
    const error = new Error("This Store Owner already has a store.");
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id, created_at`,
    [
      name.trim(),
      email.trim().toLowerCase(),
      address.trim(),
      ownerId,
    ]
  );

  return result.rows[0];
};
const getStores = async ({
  name = "",
  email = "",
  address = "",
  sortBy = "name",
  order = "asc",
}) => {
  const allowedSortFields = {
    name: "s.name",
    email: "s.email",
    address: "s.address",
    rating: "average_rating",
  };

  const sortColumn = allowedSortFields[sortBy] || "s.name";
  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  const values = [];
  const conditions = [];

  if (name.trim()) {
    values.push(`%${name.trim()}%`);
    conditions.push(`s.name ILIKE $${values.length}`);
  }

  if (email.trim()) {
    values.push(`%${email.trim()}%`);
    conditions.push(`s.email ILIKE $${values.length}`);
  }

  if (address.trim()) {
    values.push(`%${address.trim()}%`);
    conditions.push(`s.address ILIKE $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       COALESCE(AVG(r.rating), 0) AS average_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id
     ORDER BY ${sortColumn} ${sortOrder}`,
    values
  );

  return result.rows;
};
const getStoreById = async (storeId) => {
  const result = await pool.query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       u.name AS owner_name,
       u.email AS owner_email,
       COALESCE(AVG(r.rating), 0) AS average_rating,
       COUNT(r.id) AS total_ratings
     FROM stores s
     JOIN users u ON u.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $1
     GROUP BY s.id, u.id`,
    [storeId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Store not found.");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};
module.exports = {
  getDashboardStats,
  createUser,
  getUsers,
  getUserById,
  createStore,
  getStores,
  getStoreById,
};





