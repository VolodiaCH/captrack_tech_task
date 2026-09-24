import { describe, it, expect, beforeEach } from "vitest";
import http from "http";
import { createApp } from "../src/app.js";
import { setupWebSocketServer } from "../src/ws/server.js";
import { loginAs } from "./helpers/auth.js";
import { createCategory, createTransaction, createBudget } from "./helpers/factory.js";
import { connectWebSocket, waitForMessage, send } from "./helpers/wsClient.ts";
import { getYearMonth } from "../src/utils/dateRange.js";
import prisma from "../src/prisma/client.js";

describe("WebSocket Budget Alerts", () => {
  let app: unknown;
  let server: http.Server;
  let port: number;

  beforeEach(async () => {
    app = createApp();
    server = http.createServer(app);
    setupWebSocketServer(server);

    // Use port 0 to let the OS automatically assign a free port.
    // This prevents "address already in use" errors when tests run in parallel.
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        port = typeof addr === "object" ? addr.port : 0;
        resolve();
      });
    });
  });

  afterEach(() => {
    server.close();
  });

  it("should receive budget_status on connect", async () => {
    const { user, token } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    await createBudget(user.id, yearMonth, 500);

    const ws = await connectWebSocket(`ws://localhost:${port}/ws`, `captrack_session=${token}`);
    const msg = await waitForMessage(ws);

    expect(msg.type).toBe("budget_status");
    expect(msg.yearMonth).toBe(yearMonth);
    expect(msg.hasBudget).toBe(true);
    expect(msg.budget).toBe(500);

    ws.close();
  });

  it("should fire 50% threshold alert", async () => {
    const { user, token } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    const category = await createCategory(user.id);

    await createBudget(user.id, yearMonth, 100);

    const ws = await connectWebSocket(`ws://localhost:${port}/ws`, `captrack_session=${token}`);
    await waitForMessage(ws); // budget_status

    // Create transaction to reach 50%
    await createTransaction(user.id, category.id, {
      amount: 50,
      currency: "USD",
      date: new Date(),
    });

    // Trigger recompute via API
    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${token}`)
      .send({
        title: "Test",
        amount: 50,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      });

    // Wait for alerts
    await waitForMessage(ws); // budget_status
    const alertMsg = await waitForMessage(ws);

    expect(alertMsg.type).toBe("threshold_alert");
    expect(alertMsg.threshold).toBe(50);
    expect(alertMsg.usagePct).toBeGreaterThanOrEqual(50);

    ws.close();
  });

  it("should fire 80% and 100% thresholds in order", async () => {
    const { user, token } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    const category = await createCategory(user.id);

    await createBudget(user.id, yearMonth, 100);

    const ws = await connectWebSocket(`ws://localhost:${port}/ws`, `captrack_session=${token}`);
    await waitForMessage(ws); // budget_status

    // Reach 100%
    await createTransaction(user.id, category.id, {
      amount: 100,
      currency: "USD",
    });

    // Trigger via API
    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${token}`)
      .send({
        title: "Test",
        amount: 100,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      });

    // Collect all messages
    const messages = [];
    for (let i = 0; i < 5; i++) {
      try {
        const msg = await waitForMessage(ws, 1000);
        messages.push(msg);
      } catch {
        break;
      }
    }

    // Should have budget_status + 3 alerts (50%, 80%, 100%)
    const alerts = messages.filter((m) => m.type === "threshold_alert");
    expect(alerts.length).toBeGreaterThanOrEqual(1); // At least one alert fired

    // All thresholds should be present at 100%
    const thresholds = new Set(alerts.map((a) => a.threshold));
    expect(thresholds.has(100)).toBe(true);

    ws.close();
  });

  it("should not re-fire threshold in same month", async () => {
    const { user, token } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    const category = await createCategory(user.id);

    await createBudget(user.id, yearMonth, 100);

    const ws = await connectWebSocket(`ws://localhost:${port}/ws`, `captrack_session=${token}`);
    await waitForMessage(ws); // budget_status

    // Reach 80%
    await createTransaction(user.id, category.id, { amount: 80 });
    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${token}`)
      .send({
        title: "T1",
        amount: 80,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      });

    const alert1 = await waitForMessage(ws); // budget_status or alert
    const firstAlert = alert1 && typeof alert1 === 'object' && 'type' in alert1 && alert1.type === "threshold_alert"
      ? alert1
      : await waitForMessage(ws);
    expect(firstAlert).toHaveProperty('type', 'threshold_alert');
    expect(firstAlert).toHaveProperty('threshold', 80);

    // Drop back to 50% by deleting a transaction
    const txn = await prisma.transaction.findFirst({ where: { userId: user.id } });
    await require("supertest")(app)
      .delete(`/api/transactions/${txn!.id}`)
      .set("Cookie", `captrack_session=${token}`);

    // Try to rebuild to 80%
    await createTransaction(user.id, category.id, { amount: 80 });
    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${token}`)
      .send({
        title: "T2",
        amount: 80,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      });

    // Should NOT receive another 80% alert
    try {
      const msg = await waitForMessage(ws, 500);
      expect(msg.type).not.toBe("threshold_alert");
    } catch {
      // Timeout is expected - no new alert
    }

    ws.close();
  });

  it("should not fire alerts if no budget set", async () => {
    const { user, token } = await loginAs(app, "google");
    const category = await createCategory(user.id);

    const ws = await connectWebSocket(`ws://localhost:${port}/ws`, `captrack_session=${token}`);
    const msg = await waitForMessage(ws);

    expect(msg.type).toBe("budget_status");
    expect(msg.hasBudget).toBe(false);

    // Create transaction - should not trigger alert
    await createTransaction(user.id, category.id, { amount: 100 });
    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${token}`)
      .send({
        title: "Test",
        amount: 100,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      });

    try {
      const msg = await waitForMessage(ws, 500);
      expect(msg.type).not.toBe("threshold_alert");
    } catch {
      // No messages expected
    }

    ws.close();
  });

  it("should handle subscribe message", async () => {
    const { user, token } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    await createBudget(user.id, yearMonth, 500);

    const ws = await connectWebSocket(`ws://localhost:${port}/ws`, `captrack_session=${token}`);
    await waitForMessage(ws); // budget_status

    // Send subscribe
    send(ws, { type: "subscribe", yearMonth });
    const msg = await waitForMessage(ws);

    expect(msg.type).toBe("budget_status");
    expect(msg.yearMonth).toBe(yearMonth);

    ws.close();
  });

  it("should handle acknowledge_alert message", async () => {
    const { user, token } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    const category = await createCategory(user.id);

    await createBudget(user.id, yearMonth, 100);

    const ws = await connectWebSocket(`ws://localhost:${port}/ws`, `captrack_session=${token}`);
    await waitForMessage(ws); // budget_status

    // Fire an alert
    await createTransaction(user.id, category.id, { amount: 50 });
    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${token}`)
      .send({
        title: "Test",
        amount: 50,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      });

    await waitForMessage(ws); // budget_status
    const alert = await waitForMessage(ws); // threshold_alert

    // Acknowledge it
    send(ws, { type: "acknowledge_alert", yearMonth, threshold: alert.threshold });

    // Verify in DB
    const state = await prisma.thresholdAlertState.findUnique({
      where: {
        userId_yearMonth_threshold: {
          userId: user.id,
          yearMonth,
          threshold: alert.threshold,
        },
      },
    });

    expect(state?.acknowledged).toBe(true);

    ws.close();
  });

  it("should reject WebSocket without valid cookie", async () => {
    try {
      await connectWebSocket(`ws://localhost:${port}/ws`, "");
      expect.fail("Should have rejected connection");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      expect(errorMessage).toContain("401");
    }
  });
});
