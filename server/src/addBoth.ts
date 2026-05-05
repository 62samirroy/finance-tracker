import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const addBoth = async () => {
    const ds = new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await ds.initialize();
        console.log("Connected to DB.");

        console.log("🛠 Adding BOTH camelCase and snake_case columns to ensure compatibility...");
        
        await ds.query(`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS "resetPasswordToken" character varying,
            ADD COLUMN IF NOT EXISTS "resetPasswordExpires" timestamp without time zone,
            ADD COLUMN IF NOT EXISTS "createdAt" timestamp without time zone,
            ADD COLUMN IF NOT EXISTS "updatedAt" timestamp without time zone;
        `);

        // Also ensure the snake_case ones exist
        await ds.query(`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS "reset_password_token" character varying,
            ADD COLUMN IF NOT EXISTS "reset_password_expires" timestamp without time zone,
            ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone,
            ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone;
        `);

        console.log("✅ All variations added!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed:", err);
        process.exit(1);
    }
};

addBoth();
