import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Account } from "./entities/Account";
import { Transaction } from "./entities/Transaction";
import { Budget } from "./entities/Budget";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // Be careful with this in production
    logging: false,
    entities: [Account, Transaction, Budget],
    migrations: [],
    subscribers: [],
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});
