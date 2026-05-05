import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const fixCasing = async () => {
    const ds = new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await ds.initialize();
        console.log("Connected to DB.");

        console.log("🛠 Renaming columns to lowercase to avoid case-sensitivity issues...");
        
        await ds.query(`
            ALTER TABLE "user" 
            RENAME COLUMN "resetPasswordToken" TO reset_password_token;
        `);
        
        await ds.query(`
            ALTER TABLE "user" 
            RENAME COLUMN "resetPasswordExpires" TO reset_password_expires;
        `);

        await ds.query(`
            ALTER TABLE "user" 
            RENAME COLUMN "createdAt" TO created_at;
        `);

        await ds.query(`
            ALTER TABLE "user" 
            RENAME COLUMN "updatedAt" TO updated_at;
        `);

        console.log("✅ Columns renamed successfully!");
        process.exit(0);
    } catch (err: any) {
        if (err.message.includes("does not exist")) {
            console.log("⚠️ One or more columns already renamed or missing. Continuing...");
            process.exit(0);
        }
        console.error("❌ Failed to rename columns:", err);
        process.exit(1);
    }
};

fixCasing();
