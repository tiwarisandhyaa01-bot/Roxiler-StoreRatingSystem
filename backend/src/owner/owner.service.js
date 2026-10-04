const pool = require("../config/db");

const getOwnerDashboard = async (ownerId) => {
  const storeResult = await pool.query(
    `SELECT id, name, email, address
     FROM stores
     WHERE owner_id = $1`,
    [ownerId]
  );

  if (storeResult.rows.length === 0) {
    const error = new Error("Store not found for this Store Owner.");
    error.statusCode = 404;
    throw error;
  }

  const store = storeResult.rows[0];

  const result = await pool.query(
    `SELECT
       u.id AS user_id,
       u.name AS user_name,
       u.email AS user_email,
       r.rating,
       r.updated_at
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.updated_at DESC`,
    [store.id]
  );

  const averageResult = await pool.query(
    `SELECT COALESCE(AVG(rating), 0) AS average_rating,
            COUNT(*) AS total_ratings
     FROM ratings
     WHERE store_id = $1`,
    [store.id]
  );

  return {
    store,
    averageRating: averageResult.rows[0].average_rating,
    totalRatings: averageResult.rows[0].total_ratings,
    ratings: result.rows,
  };
};

module.exports = {
  getOwnerDashboard,
};
