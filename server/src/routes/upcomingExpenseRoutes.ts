import { Router } from "express";
import service from "../services/UpcomingExpenseService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch upcoming expenses" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to create upcoming expense" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await service.update(Number(req.params.id), req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update upcoming expense" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await service.delete(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete upcoming expense" });
  }
});

export default router;
