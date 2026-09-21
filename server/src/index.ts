import http from "http";
import { loadEnv } from "./config/env.js";
import { createApp } from "./app.js";
import { setupWebSocketServer } from "./ws/server.js";
import { getYearMonth } from "./utils/dateRange.js";
import * as alertService from "./services/alert.service.js";
import { ConnectionManager } from "./ws/connectionManager.js";

const env = loadEnv();

const app = createApp();
const server = http.createServer(app);
const connectionManager = setupWebSocketServer(server);

// Store connection manager for use in routes (for testing)
app.locals.connectionManager = connectionManager;
app.locals.notifyThresholds = async (userId: string, yearMonth: string) => {
  const newAlerts = await alertService.recomputeThresholds(userId, yearMonth);
  for (const alert of newAlerts) {
    connectionManager.broadcastToSubscribed(userId, yearMonth, {
      type: "threshold_alert",
      ...alert,
    });
  }

  // Broadcast updated budget status
  const { getBudgetStatus } = await import("./services/budget.service.js");
  const status = await getBudgetStatus(userId, yearMonth);
  connectionManager.broadcastToSubscribed(userId, yearMonth, {
    type: "budget_status",
    yearMonth,
    hasBudget: status.hasBudget,
    budget: status.budget,
    spent: status.spent,
    remaining: status.remaining,
    usagePct: status.usagePct,
  });
};

server.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
