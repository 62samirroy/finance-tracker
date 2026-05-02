import { Router } from "express";
import * as budgetController from "../controllers/BudgetController";

const router = Router();

router.get("/:month", budgetController.getBudget);
router.post("/", budgetController.setBudget);

export default router;
