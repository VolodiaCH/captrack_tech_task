import { Decimal } from "@prisma/client/runtime/library.js";
import prisma from "../prisma/client.js";
import { getMonthStart, getMonthEnd } from "../utils/dateRange.js";

export interface BudgetStatus {
  hasBudget: boolean;
  budget?: number;
  spent: number;
  remaining?: number;
  usagePct?: number;
  currency?: string;
}

export async function setBudget(userId: string, yearMonth: string, amount: number, currency: string) {
  return await prisma.budget.upsert({
    where: { userId_yearMonth: { userId, yearMonth } },
    create: {
      userId,
      yearMonth,
      amount: new Decimal(amount),
      currency,
    },
    update: {
      amount: new Decimal(amount),
      currency,
    },
  });
}

export async function getBudgetStatus(userId: string, yearMonth: string): Promise<BudgetStatus> {
  const budget = await prisma.budget.findUnique({
    where: { userId_yearMonth: { userId, yearMonth } },
  });

  if (!budget) {
    return { hasBudget: false, spent: 0 };
  }

  // Calculate total spent for matching currency only
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      currency: budget.currency,
      date: {
        gte: getMonthStart(yearMonth),
        lte: getMonthEnd(yearMonth),
      },
    },
    select: { amount: true },
  });

  const spent = transactions.reduce((sum, t) => sum.plus(t.amount), new Decimal(0));
  const spentNum = parseFloat(spent.toString());
  const budgetNum = parseFloat(budget.amount.toString());
  const remaining = budgetNum - spentNum;
  const usagePct = (spentNum / budgetNum) * 100;

  return {
    hasBudget: true,
    budget: budgetNum,
    spent: spentNum,
    remaining,
    usagePct: Math.round(usagePct * 100) / 100,
    currency: budget.currency,
  };
}
