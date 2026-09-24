import { Router, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/middleware.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import * as transactionService from "../services/transaction.service.js";
import { getErrorMessage } from "../utils/errors.js";

export const router = Router();

const queryFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  dateRange: z.enum(["thisMonth", "lastMonth", "custom"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(50),
});

router.get("/", requireAuth, validateQuery(queryFiltersSchema), async (req: Request, res: Response) => {
  try {
    // Calculate date range if needed
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (req.query.dateRange === "thisMonth") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    } else if (req.query.dateRange === "lastMonth") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
    } else if (req.query.dateRange === "custom") {
      startDate = req.query.startDate as string;
      endDate = req.query.endDate as string;
    }

    const result = await transactionService.getTransactions(req.user!.userId, {
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      startDate,
      endDate,
      minAmount: req.query.minAmount ? Number(req.query.minAmount as string) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount as string) : undefined,
      page: req.query.page ? Number(req.query.page as string) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize as string) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.post("/", requireAuth, validateBody(transactionService.createTransactionSchema), async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.createTransaction(req.user!.userId, req.body);

    // Trigger alert recomputation
    const yearMonth = transactionService.getTransactionMonth(transaction);
    if (req.app.locals.notifyThresholds) {
      await req.app.locals.notifyThresholds(req.user!.userId, yearMonth);
    }

    res.status(201).json(transaction);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message === "Category not found") {
      res.status(404).json({ error: "Category not found" });
    } else {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  }
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.getTransaction(req.user!.userId, req.params.id);
    res.json(transaction);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message === "Transaction not found") {
      res.status(404).json({ error: "Transaction not found" });
    } else {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  }
});

router.put("/:id", requireAuth, validateBody(transactionService.createTransactionSchema), async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.updateTransaction(req.user!.userId, req.params.id, req.body);

    // Trigger alert recomputation for the new month
    const yearMonth = transactionService.getTransactionMonth(transaction);
    if (req.app.locals.notifyThresholds) {
      await req.app.locals.notifyThresholds(req.user!.userId, yearMonth);
    }

    res.json(transaction);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message === "Transaction not found" || message === "Category not found") {
      res.status(404).json({ error: message });
    } else {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    // Get the transaction before deleting to extract the month
    const prisma = (await import("../prisma/client.js")).default;
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });

    if (!transaction || transaction.userId !== req.user!.userId) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    const yearMonth = transactionService.getTransactionMonth(transaction);

    await transactionService.deleteTransaction(req.user!.userId, req.params.id);

    // Trigger alert recomputation
    if (req.app.locals.notifyThresholds) {
      await req.app.locals.notifyThresholds(req.user!.userId, yearMonth);
    }

    res.status(204).send();
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message === "Transaction not found") {
      res.status(404).json({ error: "Transaction not found" });
    } else {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  }
});
