import { Request, Response } from "express";
import budgetService from "../services/BudgetService";
import { AuthRequest } from "../middleware/authMiddleware";

export const getBudget = async (req: AuthRequest, res: Response) => {
  const { month } = req.params;
  try {
    const budget = await budgetService.getBudgetByMonth(month as string, req.user.id);
    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const setBudget = async (req: AuthRequest, res: Response) => {
  try {
    const budget = await budgetService.setBudget(req.body, req.user.id);
    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
