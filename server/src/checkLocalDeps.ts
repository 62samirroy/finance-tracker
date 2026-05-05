import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    const ds = new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await ds.initialize();
        const res = await ds.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('study_log', 'contest', 'practice_session')");
        console.log("Found tables:", res);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
