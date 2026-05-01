# Personal Finance Tracker

## Prerequisites
- Node.js
- PostgreSQL

## Database Setup
1. Create a database named `finance_tracker` in PostgreSQL.
2. Run the SQL commands in `server/schema.sql` to create the tables and initialize accounts.
3. Update `server/.env` with your PostgreSQL credentials.

## Running the Application

### 1. Start the Server
```bash
cd server
npm install
npm run dev
```

### 2. Start the Client
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.
The API will be running at `http://localhost:5000`.
