import { Decimal } from "@prisma/client/runtime/library.js";
import prisma from "../prisma/client.js";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getYearMonth } from "../utils/dateRange.js";

export const createTransactionSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().min(1),
  date: z.string().datetime(),
  categoryId: z.string().min(1),
  notes: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  // Verify category ownership
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error("Category not found");
  }

  return await prisma.transaction.create({
    data: {
      userId,
      categoryId: input.categoryId,
      title: input.title,
      amount: new Decimal(input.amount),
      currency: input.currency,
      date: new Date(input.date),
      notes: input.notes,
    },
    include: { category: true },
  });
}

export async function getTransactions(
  userId: string,
  filters?: {
    search?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    pageSize?: number;
  },
) {
  const pageSize = filters?.pageSize || 50;
  const page = filters?.page || 1;
  const skip = (page - 1) * pageSize;

  const andConditions: Prisma.TransactionWhereInput[] = [];

  if (filters?.search) {
    andConditions.push({
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (filters?.categoryId) {
    andConditions.push({ categoryId: filters.categoryId });
  }

  if (filters?.startDate || filters?.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
    andConditions.push({ date: dateFilter });
  }

  if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
    const amountFilter: Prisma.DecimalFilter = {};
    if (filters.minAmount !== undefined) amountFilter.gte = new Decimal(filters.minAmount);
    if (filters.maxAmount !== undefined) amountFilter.lte = new Decimal(filters.maxAmount);
    andConditions.push({ amount: amountFilter });
  }

  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const [transactions, count] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    page,
    pageSize,
    total: count,
  };
}

export async function getTransaction(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true },
  });

  if (!transaction || transaction.userId !== userId) {
    throw new Error("Transaction not found");
  }

  return transaction;
}

export async function updateTransaction(userId: string, transactionId: string, input: CreateTransactionInput) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction || transaction.userId !== userId) {
    throw new Error("Transaction not found");
  }

  // Verify new category ownership
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error("Category not found");
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      title: input.title,
      amount: new Decimal(input.amount),
      currency: input.currency,
      date: new Date(input.date),
      categoryId: input.categoryId,
      notes: input.notes,
    },
    include: { category: true },
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction || transaction.userId !== userId) {
    throw new Error("Transaction not found");
  }

  return await prisma.transaction.delete({
    where: { id: transactionId },
  });
}

// Helper to extract the month from a transaction
export function getTransactionMonth(transaction: { date: Date }): string {
  return getYearMonth(transaction.date);
}
