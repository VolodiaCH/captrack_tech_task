import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  DATABASE_URL_TEST: z.string().optional(),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  COOKIE_NAME: z.string().default("captrack_session"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  OAUTH_REDIRECT_BASE_URL: z.string().url(),
  CLIENT_ORIGIN: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const env = envSchema.parse(process.env);
  return env;
}
