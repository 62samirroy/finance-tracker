const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected.');

    await client.query('DROP TABLE IF EXISTS "user" CASCADE');
    await client.query('DROP TABLE IF EXISTS "users" CASCADE');
    
    await client.query(`
      CREATE TABLE "users" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Successfully recreated users table.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
