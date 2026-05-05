import { Request, Response } from "express";
import accountService from "../services/AccountService";

export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAllAccounts();
    console.log(`📊 DB_FETCH: Found ${accounts.length} accounts.`);
    res.json(accounts);
  } catch (err: any) {
    console.error("🔥 ERROR getAllAccounts:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;
  try {
    const account = await accountService.updateBalance(Number(id), Number(balance));
    res.json(account);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
