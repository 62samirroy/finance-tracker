import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Account } from "./entities/Account";
import { Transaction } from "./entities/Transaction";
import { Budget } from "./entities/Budget";
import { UpcomingExpense } from "./entities/UpcomingExpense";
import { LentMoney } from "./entities/LentMoney";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [Account, Transaction, Budget, UpcomingExpense, LentMoney],
    migrations: [],
    subscribers: [],
    ssl: process.env.DATABASE_URL?.includes('railway.net') ? { rejectUnauthorized: false } : false,
    extra: {
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    }
});
