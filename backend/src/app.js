const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./auth/auth.routes");
const adminRoutes = require("./admin/admin.routes");
const storeRoutes = require("./store/store.routes");
const ownerRoutes = require("./owner/owner.routes");

const app = express();

// Allowed origins for CORS (local development + optional production frontend)
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

const getAllowedOrigins = () => {
  const origins = [...defaultAllowedOrigins];
  if (process.env.FRONTEND_URL) {
    const custom = process.env.FRONTEND_URL.split(",")
      .map((url) => url.trim().replace(/\/+$/, ""))
      .filter(Boolean);
    origins.push(...custom);
  }
  return origins;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (e.g. Postman, curl) and same-origin requests
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/+$/, "");
    const allowed = getAllowedOrigins();

    // If FRONTEND_URL is not set, allow all origins during initial/local setup
    // If FRONTEND_URL is set, restrict to configured and local origins
    if (!process.env.FRONTEND_URL || allowed.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/owner", ownerRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Roxiler Store Rating API is running",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection is working",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "PostgreSQL connection failed",
    });
  }
});

module.exports = app;


