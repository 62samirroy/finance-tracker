import { Router } from "express";
import * as accountController from "../controllers/AccountController";

const router = Router();

router.get("/", accountController.getAllAccounts);
router.put("/:id", accountController.updateAccount);

export default router;
