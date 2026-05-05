import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const inspect = async () => {
    const ds = new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await ds.initialize();
        console.log("Connected to DB:", process.env.DATABASE_URL);

        const columns = await ds.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name ILIKE 'user'
        `);
        console.log("Columns found in 'user' table:");
        console.table(columns);

        const tables = await ds.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name ILIKE 'user'
        `);
        console.log("Tables found:");
        console.table(tables);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspect();
