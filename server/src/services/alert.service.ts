import prisma from "../prisma/client.js";
import * as budgetService from "./budget.service.js";

const THRESHOLDS = [50, 80, 100];

export interface ThresholdAlert {
  threshold: number;
  yearMonth: string;
  spent: number;
  budget: number;
  usagePct: number;
  firedAt: string;
  replay: boolean;
}

export async function recomputeThresholds(userId: string, yearMonth: string): Promise<ThresholdAlert[]> {
  const budgetStatus = await budgetService.getBudgetStatus(userId, yearMonth);

  if (!budgetStatus.hasBudget) {
    return []; // Alerts disabled if no budget
  }

  const newlyFired: ThresholdAlert[] = [];
  const { spent, usagePct: usagePctValue, budget } = budgetStatus;

  for (const threshold of THRESHOLDS) {
    if (usagePctValue! >= threshold) {
      try {
        const alert = await prisma.thresholdAlertState.create({
          data: {
            userId,
            yearMonth,
            threshold,
          },
        });

        newlyFired.push({
          threshold,
          yearMonth,
          spent,
          budget: budget!,
          usagePct: usagePctValue!,
          firedAt: alert.firedAt.toISOString(),
          replay: false,
        });
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err && err.code !== "P2002") throw err;
      }
    }
  }

  return newlyFired;
}

export async function getUnacknowledgedAlerts(userId: string, yearMonth: string): Promise<ThresholdAlert[]> {
  const budgetStatus = await budgetService.getBudgetStatus(userId, yearMonth);

  if (!budgetStatus.hasBudget) {
    return [];
  }

  const alerts = await prisma.thresholdAlertState.findMany({
    where: {
      userId,
      yearMonth,
      acknowledged: false,
    },
  });

  return alerts.map((a) => ({
    threshold: a.threshold,
    yearMonth,
    spent: budgetStatus.spent,
    budget: budgetStatus.budget!,
    usagePct: budgetStatus.usagePct!,
    firedAt: a.firedAt.toISOString(),
    replay: true,
  }));
}

export async function acknowledgeAlert(userId: string, yearMonth: string, threshold: number) {
  return await prisma.thresholdAlertState.update({
    where: {
      userId_yearMonth_threshold: {
        userId,
        yearMonth,
        threshold,
      },
    },
    data: {
      acknowledged: true,
      acknowledgedAt: new Date(),
    },
  });
}
