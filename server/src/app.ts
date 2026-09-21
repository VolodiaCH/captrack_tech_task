import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { loadEnv } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { router as authRoutes } from "./routes/auth.routes.js";
import { router as categoryRoutes } from "./routes/categories.routes.js";
import { router as transactionRoutes } from "./routes/transactions.routes.js";
import { router as budgetRoutes } from "./routes/budgets.routes.js";

const env = loadEnv();

export function createApp() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(
    express.cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    } as any),
  );
  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/budgets", budgetRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
}
