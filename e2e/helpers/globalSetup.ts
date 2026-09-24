import { execSync } from 'child_process';

async function globalSetup() {
  // Run migrations on captrack_e2e database
  console.log('Running migrations on captrack_e2e database...');
  try {
    execSync(
      'npx prisma migrate deploy --skip-generate',
      {
        cwd: './server',
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL_E2E,
        },
        stdio: 'inherit',
      }
    );
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }

  // Truncate all tables (reset to clean state)
  console.log('Resetting database...');
  const { Client } = require('pg');
  const dbUrl = new URL(process.env.DATABASE_URL_E2E || '');

  const client = new Client({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '5432'),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
  });

  await client.connect();

  try {
    // Truncate all tables in order (respecting FK constraints)
    await client.query(`
      TRUNCATE TABLE "Alert" RESTART IDENTITY CASCADE;
      TRUNCATE TABLE "Budget" RESTART IDENTITY CASCADE;
      TRUNCATE TABLE "Transaction" RESTART IDENTITY CASCADE;
      TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE;
      TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;
    `);
    console.log('Database truncated successfully');
  } finally {
    await client.end();
  }
}

export default globalSetup;
