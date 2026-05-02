import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import accountRoutes from "./routes/accountRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import { Account } from "./entities/Account";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://finance-tracker-eight-ecru.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (req, res) => res.send("Finance Tracker API (TypeScript/TypeORM) is running"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

// Error logging middleware (MUST be at the end)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function seedInitialData() {
  const accountRepository = AppDataSource.getRepository(Account);
  const count = await accountRepository.count();
  if (count === 0) {
    console.log("🌱 No accounts found. Seeding initial data...");
    const initialAccounts = [
      { name: 'Punjab Bank', balance: 0 },
      { name: 'SBI Bank', balance: 0 },
      { name: 'Jio Payments', balance: 0 },
      { name: 'Maa Savings', balance: 0 }
    ];
    for (const acc of initialAccounts) {
      const newAccount = accountRepository.create(acc);
      await accountRepository.save(newAccount);
    }
    console.log("✨ Seeding completed!");
  } else {
    console.log(`📊 Database already has ${count} accounts.`);
  }
}

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");
        await seedInitialData();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
