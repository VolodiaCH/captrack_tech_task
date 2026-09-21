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

export async function truncateAll() {
  try {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "User","Category","Transaction","Budget","ThresholdAlertState" RESTART IDENTITY CASCADE`,
    );
  } catch (err) {
    console.error("Error truncating tables:", err);
  }
}
