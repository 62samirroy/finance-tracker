import { DataSource } from "typeorm";
import { Account } from "./entities/Account";
import { Budget } from "./entities/Budget";
import { Transaction } from "./entities/Transaction";
import { User } from "./entities/User";
import { UpcomingExpense } from "./entities/UpcomingExpense";
import { LentMoney } from "./entities/LentMoney";
import dotenv from "dotenv";

dotenv.config();

const cleanup = async () => {
    console.log("🧹 Starting database cleanup to resolve duplicate constraints...");
    
    const CleanDataSource = new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        synchronize: false,
        entities: [Account, Transaction, Budget, UpcomingExpense, LentMoney, User],
        ssl: { rejectUnauthorized: false }
    });

    try {
        await CleanDataSource.initialize();
        console.log("✅ Connected to database.");

        const accountRepo = CleanDataSource.getRepository(Account);
        const transactionRepo = CleanDataSource.getRepository(Transaction);

        // 1. Merge Duplicate Accounts
        const allAccounts = await accountRepo.find({ order: { id: "ASC" } });
        const nameMap = new Map<string, Account>();
        const toDelete: number[] = [];

        for (const acc of allAccounts) {
            if (nameMap.has(acc.name)) {
                const primary = nameMap.get(acc.name)!;
                console.log(`⚠️ Merging duplicate account: "${acc.name}" (ID: ${acc.id}) -> (ID: ${primary.id})`);
                
                await transactionRepo.createQueryBuilder()
                    .update()
                    .set({ source_account_id: primary.id })
                    .where("source_account_id = :oldId", { oldId: acc.id })
                    .execute();

                await transactionRepo.createQueryBuilder()
                    .update()
                    .set({ destination_account_id: primary.id })
                    .where("destination_account_id = :oldId", { oldId: acc.id })
                    .execute();

                toDelete.push(acc.id);
            } else {
                nameMap.set(acc.name, acc);
            }
        }

        if (toDelete.length > 0) {
            await accountRepo.delete(toDelete);
            console.log(`✅ Deleted ${toDelete.length} duplicates.`);
        }

        console.log("✨ Cleanup completed!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
        process.exit(1);
    }
};

cleanup();
