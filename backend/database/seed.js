const bcrypt = require("bcrypt");
const pool = require("../src/config/db");

async function seedDatabase() {
  console.log("Starting minimal safe test data seeding...");

  try {
    // 1. Seed Administrator
    const adminEmail = "admin@roxiler.com";
    const adminCheck = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail]);
    let adminId;

    if (adminCheck.rows.length === 0) {
      const adminPassHash = await bcrypt.hash("Admin@1234", 10);
      const adminResult = await pool.query(
        `INSERT INTO users (name, email, password, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          "System Operations Administrator",
          adminEmail,
          adminPassHash,
          "100 Executive Boulevard, Tech Center, CA 94016",
          "ADMIN"
        ]
      );
      adminId = adminResult.rows[0].id;
      console.log(`Created Admin user: ${adminEmail} (ID: ${adminId})`);
    } else {
      adminId = adminCheck.rows[0].id;
      console.log(`Admin user already exists: ${adminEmail} (ID: ${adminId})`);
    }

    // 2. Seed Store Owner
    const ownerEmail = "owner@roxiler.com";
    const ownerCheck = await pool.query("SELECT id FROM users WHERE email = $1", [ownerEmail]);
    let ownerId;

    if (ownerCheck.rows.length === 0) {
      const ownerPassHash = await bcrypt.hash("Owner@1234", 10);
      const ownerResult = await pool.query(
        `INSERT INTO users (name, email, password, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          "Marcus Vance Store Merchant",
          ownerEmail,
          ownerPassHash,
          "240 Craft Artisan Way, Portland, OR 97201",
          "STORE_OWNER"
        ]
      );
      ownerId = ownerResult.rows[0].id;
      console.log(`Created Store Owner: ${ownerEmail} (ID: ${ownerId})`);
    } else {
      ownerId = ownerCheck.rows[0].id;
      console.log(`Store Owner already exists: ${ownerEmail} (ID: ${ownerId})`);
    }

    // 3. Seed Normal User
    const userEmail = "user@roxiler.com";
    const userCheck = await pool.query("SELECT id FROM users WHERE email = $1", [userEmail]);
    let userId;

    if (userCheck.rows.length === 0) {
      const userPassHash = await bcrypt.hash("User@1234", 10);
      const userResult = await pool.query(
        `INSERT INTO users (name, email, password, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          "Eleanor Vance Consumer Reviewer",
          userEmail,
          userPassHash,
          "450 Boulevard Saint-Germain, Seattle, WA 98101",
          "USER"
        ]
      );
      userId = userResult.rows[0].id;
      console.log(`Created Normal User: ${userEmail} (ID: ${userId})`);
    } else {
      userId = userCheck.rows[0].id;
      console.log(`Normal User already exists: ${userEmail} (ID: ${userId})`);
    }

    // 4. Seed Storefront linked to Store Owner
    const storeEmail = "contact@heritagecraft.com";
    const storeCheck = await pool.query("SELECT id FROM stores WHERE owner_id = $1", [ownerId]);
    let storeId;

    if (storeCheck.rows.length === 0) {
      const storeResult = await pool.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          "Heritage Craft Roasters & Market",
          storeEmail,
          "240 Craft Artisan Way, Suite 100, Portland, OR 97201",
          ownerId
        ]
      );
      storeId = storeResult.rows[0].id;
      console.log(`Created Store: Heritage Craft Roasters & Market (ID: ${storeId}, Owner: ${ownerId})`);
    } else {
      storeId = storeCheck.rows[0].id;
      console.log(`Store for Owner ${ownerId} already exists (ID: ${storeId})`);
    }

    // 5. Seed Initial Rating
    const ratingCheck = await pool.query(
      "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
      [userId, storeId]
    );

    if (ratingCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO ratings (user_id, store_id, rating)
         VALUES ($1, $2, $3)`,
        [userId, storeId, 5]
      );
      console.log(`Created initial 5-star rating by User ${userId} on Store ${storeId}`);
    } else {
      console.log(`Rating by User ${userId} on Store ${storeId} already exists`);
    }

    console.log("\nMinimal safe test data successfully seeded!");
    console.log("Test Credentials:");
    console.log("  • Admin:       admin@roxiler.com / Admin@1234");
    console.log("  • Store Owner: owner@roxiler.com / Owner@1234");
    console.log("  • Normal User: user@roxiler.com / User@1234");

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedDatabase();
