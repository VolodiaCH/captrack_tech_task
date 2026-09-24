import { Router, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/middleware.js";
import { validateBody } from "../middleware/validate.js";
import * as categoryService from "../services/category.service.js";
import { getErrorMessage } from "../utils/errors.js";

export const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories(req.user!.userId);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/", requireAuth, validateBody(createCategorySchema), async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.user!.userId, req.body.name);
    res.status(201).json(category);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === "P2002") {
      res.status(409).json({ error: "Category name already exists" });
    } else {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  }
});

router.patch("/:id", requireAuth, validateBody(updateCategorySchema), async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory(req.user!.userId, req.params.id, req.body.name);
    res.json(category);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message === "Cannot rename the default Uncategorized category") {
      res.status(400).json({ error: message });
    } else if (message === "Category not found") {
      res.status(404).json({ error: "Category not found" });
    } else if (error instanceof Error && 'code' in error && error.code === "P2002") {
      res.status(409).json({ error: "Category name already exists" });
    } else {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(req.user!.userId, req.params.id);
    res.status(204).send();
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message === "Cannot delete the default Uncategorized category" || message === "Default category not found") {
      res.status(400).json({ error: message });
    } else if (message === "Category not found") {
      res.status(404).json({ error: "Category not found" });
    } else {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
});
