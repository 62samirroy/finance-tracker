import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const recreateUserTable = async () => {
    const ds = new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await ds.initialize();
        console.log("Connected to DB.");

        console.log("💥 Dropping existing 'user' table...");
        // Use CASCADE to remove any foreign key constraints from external apps
        await ds.query('DROP TABLE IF EXISTS "user" CASCADE');

        console.log("🏗 Creating fresh 'user' table...");
        await ds.query(`
            CREATE TABLE "user" (
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

        console.log("✨ User table recreated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to recreate user table:", err);
        process.exit(1);
    }
};

recreateUserTable();
