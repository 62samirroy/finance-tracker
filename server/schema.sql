-- Create Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'salary', 'transfer', 'expense', 'emi', 'budget_withdraw', 'self_transfer'
    category VARCHAR(100),
    source_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    destination_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    note TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL UNIQUE, -- Format: YYYY-MM
    amount DECIMAL(15, 2) NOT NULL,
    withdrawn_from_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize default accounts
INSERT INTO accounts (name, balance) VALUES 
('Punjab Bank', 0.00),
('SBI', 0.00),
('Jio', 0.00),
('Maa Account', 0.00)
ON CONFLICT (name) DO NOTHING;

-- Create User table
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
