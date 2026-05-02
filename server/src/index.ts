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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.get("/api/health", (req, res) => res.json({ 
  status: "ok", 
  database: AppDataSource.isInitialized ? "connected" : "connecting" 
}));

app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

// Error logging middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function seedInitialData() {
  try {
    const accountRepository = AppDataSource.getRepository(Account);
    const initialAccounts = [
      { name: 'Punjab', balance: 90.00 },
      { name: 'SBI', balance: 436.00 },
      { name: 'Jio', balance: 2602.00 },
      { name: 'Maa', balance: 31000.00 }
    ];

    for (const acc of initialAccounts) {
      // Check for exact name
      let account = await accountRepository.findOneBy({ name: acc.name });
      
      // If not found, check if an "old" version exists to rename it
      if (!account) {
        const oldName = acc.name === 'Punjab' ? 'Punjab Bank' : 
                        acc.name === 'SBI' ? 'SBI Bank' :
                        acc.name === 'Jio' ? 'Jio Payments' :
                        acc.name === 'Maa' ? 'Maa Savings' : null;
        
        if (oldName) {
          account = await accountRepository.findOneBy({ name: oldName });
          if (account) {
            console.log(`🔄 Updating ${oldName} to ${acc.name}`);
            account.name = acc.name;
          }
        }
      }

      if (!account) {
        console.log(`🌱 Creating account: ${acc.name}`);
        account = accountRepository.create(acc);
      }

      // Always ensure the balance matches your provided data for this sync
      account.balance = acc.balance;
      await accountRepository.save(account);
    }
    console.log("✨ Account sync completed!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}

// Start server immediately to satisfy health checks
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    
    // Initialize DB in the background
    console.log("📡 Initializing database connection...");
    AppDataSource.initialize()
        .then(async () => {
            console.log("✅ Data Source has been initialized!");
            await seedInitialData();
        })
        .catch((err) => {
            console.error("❌ Error during Data Source initialization:", err);
        });
});
