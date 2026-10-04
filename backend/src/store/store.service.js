const pool = require("../config/db");

const getStores = async (userId, { name = "", address = "", sortBy = "name", order = "asc" }) => {
  const allowedSortFields = {
    name: "s.name",
    address: "s.address",
    average_rating: "average_rating",
  };

  const sortColumn = allowedSortFields[sortBy] || "s.name";
  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  const values = [userId];
  const conditions = [];

  if (name.trim()) {
    values.push(`%${name.trim()}%`);
    conditions.push(`s.name ILIKE $${values.length}`);
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
       s.address,
       COALESCE(AVG(r.rating), 0) AS average_rating,
       ur.rating AS user_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     LEFT JOIN ratings ur
       ON ur.store_id = s.id
       AND ur.user_id = $1
     ${whereClause}
     GROUP BY s.id, ur.rating
     ORDER BY ${sortColumn} ${sortOrder}`,
    values
  );

  return result.rows;
};

const submitRating = async (userId, storeId, rating) => {
  const store = await pool.query(
    "SELECT id FROM stores WHERE id = $1",
    [storeId]
  );

  if (store.rows.length === 0) {
    const error = new Error("Store not found.");
    error.statusCode = 404;
    throw error;
  }

  const existingRating = await pool.query(
    "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
    [userId, storeId]
  );

  if (existingRating.rows.length > 0) {
    const error = new Error("You have already rated this store. Use update instead.");
    error.statusCode = 409;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, store_id, rating, created_at`,
    [userId, storeId, rating]
  );

  return result.rows[0];
};

const updateRating = async (userId, storeId, rating) => {
  const result = await pool.query(
    `UPDATE ratings
     SET rating = $1, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2 AND store_id = $3
     RETURNING id, user_id, store_id, rating, updated_at`,
    [rating, userId, storeId]
  );

  if (result.rows.length === 0) {
    const error = new Error("You have not rated this store yet.");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getStores,
  submitRating,
  updateRating,
};
