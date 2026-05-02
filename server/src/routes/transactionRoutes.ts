import { Router } from "express";
import * as transactionController from "../controllers/TransactionController";

const router = Router();

router.get("/", transactionController.getTransactions);
router.post("/", transactionController.createTransaction);
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

export default router;
