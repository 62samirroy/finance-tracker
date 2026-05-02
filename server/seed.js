const db = require('./db');

const initialAccounts = [
  { name: 'Punjab Bank', balance: 0 },
  { name: 'SBI Bank', balance: 0 },
  { name: 'Jio Payments', balance: 0 },
  { name: 'Maa Savings', balance: 0 }
];

async function seed() {
  console.log('🌱 Seeding database...');
  try {
    for (const acc of initialAccounts) {
      // Check if account already exists to avoid duplicates
      const existing = await db.query('SELECT * FROM accounts WHERE name = $1', [acc.name]);
      if (existing.rows.length === 0) {
        await db.query('INSERT INTO accounts (name, balance) VALUES ($1, $2)', [acc.name, acc.balance]);
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
