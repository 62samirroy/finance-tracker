import { AppDataSource } from "./data-source";
import { Account } from "./entities/Account";

const initialAccounts = [
  { name: 'Punjab Bank', balance: 0 },
  { name: 'SBI Bank', balance: 0 },
  { name: 'Jio Payments', balance: 0 },
  { name: 'Maa Savings', balance: 0 }
];

async function seed() {
  console.log('🌱 Seeding database...');
  try {
    await AppDataSource.initialize();
    console.log(`🔗 Connected to: ${AppDataSource.options.type}://${(AppDataSource.options as any).host || 'remote'}`);
    const accountRepository = AppDataSource.getRepository(Account);

    for (const acc of initialAccounts) {
      const existing = await accountRepository.findOneBy({ name: acc.name });
      if (!existing) {
        const newAccount = accountRepository.create(acc);
        await accountRepository.save(newAccount);
        console.log(`✅ Created account: ${acc.name}`);
      } else {
        console.log(`ℹ️ Account already exists: ${acc.name}`);
      }
    }
    console.log('✨ Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
