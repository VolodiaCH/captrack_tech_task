import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors,
    });
    return;
  }

  if (err instanceof Error) {
    if (err.message.includes("Unique constraint failed")) {
      res.status(409).json({ error: err.message });
      return;
    }
  }

  res.status(500).json({
    error: "Internal server error",
  });
};
