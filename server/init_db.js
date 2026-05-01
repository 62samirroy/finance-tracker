const db = require('./db');

const initDb = async () => {
  try {
    console.log('Initializing database...');

    // Create accounts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        balance DECIMAL(12,2) DEFAULT 0.00,
        type VARCHAR(50) DEFAULT 'bank'
      )
    `);

    // Create transactions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(12,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        source_account_id INTEGER REFERENCES accounts(id),
        destination_account_id INTEGER REFERENCES accounts(id),
        note TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create budgets table
    await db.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        month VARCHAR(7) UNIQUE NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        withdrawn_from_account_id INTEGER REFERENCES accounts(id)
      )
    `);

    // Check if initial accounts exist, if not, create them
    const accounts = await db.query('SELECT COUNT(*) FROM accounts');
    if (parseInt(accounts.rows[0].count) === 0) {
      console.log('Seeding initial accounts...');
      await db.query(`
        INSERT INTO accounts (name, balance, type) VALUES 
        ('Punjab', 0.00, 'bank'),
        ('SBI', 0.00, 'bank'),
        ('Jio', 0.00, 'wallet'),
        ('Maa', 0.00, 'bank')
      `);
    }

    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDb();
