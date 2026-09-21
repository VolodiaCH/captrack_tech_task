import { AuthedSocket, ConnectionManager } from "./connectionManager.js";
import { ClientMessage, clientMessageSchema } from "./messages.js";
import * as alertService from "../services/alert.service.js";
import * as budgetService from "../services/budget.service.js";
import { getYearMonth } from "../utils/dateRange.js";

export async function handleMessage(
  socket: AuthedSocket,
  connectionManager: ConnectionManager,
  rawMessage: string,
) {
  try {
    const message = JSON.parse(rawMessage) as ClientMessage;
    const validated = clientMessageSchema.parse(message);

    if (validated.type === "subscribe") {
      socket.subscribedMonth = validated.yearMonth;

      // Send current budget status
      const status = await budgetService.getBudgetStatus(socket.userId, validated.yearMonth);
      socket.send(
        JSON.stringify({
          type: "budget_status",
          yearMonth: validated.yearMonth,
          hasBudget: status.hasBudget,
          budget: status.budget,
          spent: status.spent,
          remaining: status.remaining,
          usagePct: status.usagePct,
        }),
      );

      // Send unacknowledged alerts
      const unacked = await alertService.getUnacknowledgedAlerts(socket.userId, validated.yearMonth);
      for (const alert of unacked) {
        socket.send(JSON.stringify(alert));
      }

      // Recompute thresholds on subscribe
      const newAlerts = await alertService.recomputeThresholds(socket.userId, validated.yearMonth);
      for (const alert of newAlerts) {
        connectionManager.broadcastToSubscribed(socket.userId, validated.yearMonth, {
          type: "threshold_alert",
          ...alert,
        });
      }
    } else if (validated.type === "acknowledge_alert") {
      await alertService.acknowledgeAlert(socket.userId, validated.yearMonth, validated.threshold);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid message",
      }),
    );
  }
}

export async function handleConnect(socket: AuthedSocket, connectionManager: ConnectionManager) {
  const yearMonth = getYearMonth();
  socket.subscribedMonth = yearMonth;

  // Send initial budget status
  const status = await budgetService.getBudgetStatus(socket.userId, yearMonth);
  socket.send(
    JSON.stringify({
      type: "budget_status",
      yearMonth,
      hasBudget: status.hasBudget,
      budget: status.budget,
      spent: status.spent,
      remaining: status.remaining,
      usagePct: status.usagePct,
    }),
  );

  // Send unacknowledged alerts for current month
  const unacked = await alertService.getUnacknowledgedAlerts(socket.userId, yearMonth);
  for (const alert of unacked) {
    socket.send(JSON.stringify(alert));
  }
}

export async function notifyThresholdAlert(
  userId: string,
  yearMonth: string,
  connectionManager: ConnectionManager,
) {
  const newAlerts = await alertService.recomputeThresholds(userId, yearMonth);
  for (const alert of newAlerts) {
    connectionManager.broadcastToSubscribed(userId, yearMonth, {
      type: "threshold_alert",
      ...alert,
    });
  }

  // Always broadcast updated budget status
  const status = await budgetService.getBudgetStatus(userId, yearMonth);
  connectionManager.broadcastToSubscribed(userId, yearMonth, {
    type: "budget_status",
    yearMonth,
    hasBudget: status.hasBudget,
    budget: status.budget,
    spent: status.spent,
    remaining: status.remaining,
    usagePct: status.usagePct,
  });
}
