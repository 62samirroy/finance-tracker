import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Account } from "./entities/Account";
import { Transaction } from "./entities/Transaction";
import { Budget } from "./entities/Budget";
import { UpcomingExpense } from "./entities/UpcomingExpense";
import { LentMoney } from "./entities/LentMoney";
import { User } from "./entities/User";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // Be careful with this in production
    logging: false,
    entities: [Account, Transaction, Budget, UpcomingExpense, LentMoney, User],
    migrations: [],
    subscribers: [],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
