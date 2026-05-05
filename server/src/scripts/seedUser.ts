import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Account } from "../entities/Account";
import { Transaction } from "../entities/Transaction";
import { Budget } from "../entities/Budget";
import { UpcomingExpense } from "../entities/UpcomingExpense";
import { LentMoney } from "../entities/LentMoney";
import bcrypt from "bcryptjs";

export const seedUser = async () => {
  console.log("🌱 SEEDING: Starting user isolation seeding...");
  
  const userRepository = AppDataSource.getRepository(User);
  const accountRepository = AppDataSource.getRepository(Account);
  const transactionRepository = AppDataSource.getRepository(Transaction);
  const budgetRepository = AppDataSource.getRepository(Budget);
  const upcomingRepository = AppDataSource.getRepository(UpcomingExpense);
  const lentRepository = AppDataSource.getRepository(LentMoney);

  const email = "sr534377@gmail.com";
  let user = await userRepository.findOneBy({ email });

  if (!user) {
    console.log(`👤 SEEDING: Creating legacy user ${email}...`);
    const hashedPassword = await bcrypt.hash("123456", 10);
    user = userRepository.create({
      email,
      password: hashedPassword,
      name: "Legacy User"
    });
    await userRepository.save(user);
  }

  // Assign existing data to this user
  console.log("🔗 SEEDING: Assigning existing data to legacy user...");

  // Accounts
  const accounts = await accountRepository.find({ where: { user: { id: undefined } } as any });
  if (accounts.length > 0) {
    accounts.forEach(a => (a as any).user = user);
    await accountRepository.save(accounts);
    console.log(`✅ SEEDING: Assigned ${accounts.length} accounts.`);
  }

  // Transactions
  const transactions = await transactionRepository.find({ where: { user: { id: undefined } } as any });
  if (transactions.length > 0) {
    transactions.forEach(t => (t as any).user = user);
    await transactionRepository.save(transactions);
    console.log(`✅ SEEDING: Assigned ${transactions.length} transactions.`);
  }

  // Budgets
  const budgets = await budgetRepository.find({ where: { user: { id: undefined } } as any });
  if (budgets.length > 0) {
    budgets.forEach(b => (b as any).user = user);
    await budgetRepository.save(budgets);
    console.log(`✅ SEEDING: Assigned ${budgets.length} budgets.`);
  }

  // Upcoming Expenses
  const upcoming = await upcomingRepository.find({ where: { user: { id: undefined } } as any });
  if (upcoming.length > 0) {
    upcoming.forEach(u => (u as any).user = user);
    await upcomingRepository.save(upcoming);
    console.log(`✅ SEEDING: Assigned ${upcoming.length} upcoming expenses.`);
  }

  // Lent Money
  const lent = await lentRepository.find({ where: { user: { id: undefined } } as any });
  if (lent.length > 0) {
    lent.forEach(l => (l as any).user = user);
    await lentRepository.save(lent);
    console.log(`✅ SEEDING: Assigned ${lent.length} lent records.`);
  }

  console.log("✨ SEEDING: User isolation seeding completed!");
};
