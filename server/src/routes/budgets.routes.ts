import { Router, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/middleware.js";
import { validateBody } from "../middleware/validate.js";
import * as budgetService from "../services/budget.service.js";

export const router = Router();

const setBudgetSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().min(1),
});

router.get("/:yearMonth", requireAuth, async (req: Request, res: Response) => {
  try {
    const { yearMonth } = req.params;
    const status = await budgetService.getBudgetStatus(req.user!.userId, yearMonth);
    res.json(status);
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

router.put("/:yearMonth", requireAuth, validateBody(setBudgetSchema), async (req: Request, res: Response) => {
  try {
    const { yearMonth } = req.params;
    await budgetService.setBudget(req.user!.userId, yearMonth, req.body.amount, req.body.currency);

    // Trigger alert recomputation
    if (req.app.locals.notifyThresholds) {
      await req.app.locals.notifyThresholds(req.user!.userId, yearMonth);
    }

    const status = await budgetService.getBudgetStatus(req.user!.userId, yearMonth);
    res.json(status);
  } catch (error) {
    console.error("Error setting budget:", error);
    res.status(500).json({ error: "Failed to set budget" });
  }
});
