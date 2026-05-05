import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const renameTable = async () => {
    const ds = new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await ds.initialize();
        console.log("Connected to DB.");

        console.log("🛠 Renaming 'user' table to 'users' to avoid reserved keyword conflicts...");
        await ds.query('ALTER TABLE IF EXISTS "user" RENAME TO "users"');

        // If it doesn't exist yet, create it
        await ds.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                reset_password_token VARCHAR(255),
                reset_password_expires TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Table is now 'users'.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to rename table:", err);
        process.exit(1);
    }
};

renameTable();
