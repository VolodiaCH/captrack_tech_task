import prisma from "../../src/prisma/client.js";
import { Decimal } from "@prisma/client/runtime/library.js";

export async function createCategory(userId: string, name = "Test Category") {
  return await prisma.category.create({
    data: { userId, name },
  });
}

export async function createTransaction(
  userId: string,
  categoryId: string,
  overrides?: Partial<{
    title: string;
    amount: number;
    currency: string;
    date: Date;
    notes: string;
  }>,
) {
  return await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      title: overrides?.title || "Test Transaction",
      amount: new Decimal(overrides?.amount || 10),
      currency: overrides?.currency || "USD",
      date: overrides?.date || new Date(),
      notes: overrides?.notes,
    },
  });
}

export async function createBudget(userId: string, yearMonth: string, amount: number) {
  return await prisma.budget.create({
    data: {
      userId,
      yearMonth,
      amount: new Decimal(amount),
      currency: "USD",
    },
  });
}
