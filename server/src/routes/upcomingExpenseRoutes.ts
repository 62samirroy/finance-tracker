import { Router, Response } from "express";
import service from "../services/UpcomingExpenseService";
import { AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getAll(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch upcoming expenses" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.create(req.body, req.user.id);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to create upcoming expense" });
  }
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.update(Number(req.params.id), req.body, req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update upcoming expense" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await service.delete(Number(req.params.id), req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete upcoming expense" });
  }
});

export default router;
