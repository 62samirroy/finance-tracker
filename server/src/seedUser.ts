import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const seedUser = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Connected to DB.");

        const userRepo = AppDataSource.getRepository(User);
        
        const email = "test@example.com";
        const password = "password123";
        const name = "Test User";

        const existing = await userRepo.findOneBy({ email });
        if (existing) {
            console.log("User already exists. Skipping seed.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepo.create({
            email,
            password: hashedPassword,
            name
        });

        await userRepo.save(user);
        console.log(`✅ Seeded user: ${email} / ${password}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedUser();
