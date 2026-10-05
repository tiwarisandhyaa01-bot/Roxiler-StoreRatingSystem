const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");

async function initDatabase() {
  console.log("Connecting to PostgreSQL...");
  
  try {
    // Test basic connection
    const testResult = await pool.query("SELECT current_database(), current_user, version()");
    console.log(`Connected successfully to database: "${testResult.rows[0].current_database}" as user: "${testResult.rows[0].current_user}"`);

    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log("Applying database schema from schema.sql...");
    await pool.query(schemaSql);
    console.log("Database schema initialized successfully.");

    // Verify created tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("Verified public tables in database:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

initDatabase();
