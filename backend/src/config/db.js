const { Pool } = require("pg");
require("dotenv").config();

const useSsl =
  process.env.DB_SSL === "true" ||
  Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost"));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

module.exports = pool;