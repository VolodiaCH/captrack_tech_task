import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env.js";

export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

const env = loadEnv();
const EXPIRY_DAYS = 7;

export function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: `${EXPIRY_DAYS}d`,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}
