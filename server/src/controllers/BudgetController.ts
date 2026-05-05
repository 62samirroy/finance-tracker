import { Request, Response } from "express";
import budgetService from "../services/BudgetService";

export const getBudget = async (req: Request, res: Response) => {
  const { month } = req.params;
  try {
    const budget = await budgetService.getBudgetByMonth(month as string);
    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const setBudget = async (req: Request, res: Response) => {
  try {
    const budget = await budgetService.setBudget(req.body);
    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
