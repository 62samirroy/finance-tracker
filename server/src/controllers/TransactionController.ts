import { Request, Response } from "express";
import transactionService from "../services/TransactionService";

export const getTransactions = async (req: Request, res: Response) => {
  const { type, month } = req.query;
  try {
    const transactions = await transactionService.getTransactions({ 
      type: type as string, 
      month: month as string 
    });
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    res.json(transaction);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const transaction = await transactionService.updateTransaction(Number(id), req.body);
    res.json(transaction);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await transactionService.deleteTransaction(Number(id));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
