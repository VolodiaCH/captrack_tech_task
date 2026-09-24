import { beforeAll, afterEach } from "vitest";
import prisma from "../src/prisma/client.js";

beforeAll(async () => {
  // Ensure migration runs on test DB
  const dbUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("No database URL configured for tests");
  }
  console.log("Using test database:", dbUrl);
});

afterEach(async () => {
  // Truncate all tables
  await truncateAll();
});

// Mutex ID for advisory lock to serialize truncation across parallel test processes
const CLEANUP_LOCK_ID = 12345;

export async function truncateAll() {
  try {
    // Acquire an exclusive advisory lock to serialize truncation.
    // This ensures only one test cleanup runs at a time, preventing deadlocks
    // when multiple test files run in parallel.
    await prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(${CLEANUP_LOCK_ID});`);

    try {
      // Disable all triggers to bypass foreign key constraints during cleanup.
      await prisma.$executeRawUnsafe(`ALTER TABLE "ThresholdAlertState" DISABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Transaction" DISABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Budget" DISABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Category" DISABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "User" DISABLE TRIGGER ALL;`);

      await prisma.$executeRawUnsafe(`DELETE FROM "ThresholdAlertState";`);
      await prisma.$executeRawUnsafe(`DELETE FROM "Transaction";`);
      await prisma.$executeRawUnsafe(`DELETE FROM "Budget";`);
      await prisma.$executeRawUnsafe(`DELETE FROM "Category";`);
      await prisma.$executeRawUnsafe(`DELETE FROM "User";`);

      await prisma.$executeRawUnsafe(`ALTER TABLE "User" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Budget" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Transaction" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "ThresholdAlertState" ENABLE TRIGGER ALL;`);
    } finally {
      // Release the advisory lock
      await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(${CLEANUP_LOCK_ID});`);
    }
  } catch (err) {
    console.error("Error truncating tables:", err);
    // Try to restore triggers even on error
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "User" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Budget" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Transaction" ENABLE TRIGGER ALL;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "ThresholdAlertState" ENABLE TRIGGER ALL;`);
    } catch {}
    // Release the lock even if cleanup failed
    try {
      await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(${CLEANUP_LOCK_ID});`);
    } catch {}
  }
}
