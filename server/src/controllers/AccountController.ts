import { Request, Response } from "express";
import accountService from "../services/AccountService";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAllAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await accountService.getAllAccounts(req.user.id);
    console.log(`📊 DB_FETCH: Found ${accounts.length} accounts for User ${req.user.id}.`);
    res.json(accounts);
  } catch (err: any) {
    console.error("🔥 ERROR getAllAccounts:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;
  try {
    const account = await accountService.updateBalance(Number(id), Number(balance), req.user.id);
    res.json(account);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
