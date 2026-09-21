import { Response } from "express";
import { loadEnv } from "../config/env.js";
import { parse } from "cookie";

const env = loadEnv();

export function setCookie(res: Response, token: string): void {
  const isProduction = env.NODE_ENV === "production";
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

export function clearCookie(res: Response): void {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
}

export function getCookieFromHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return parse(cookieHeader);
}

export function getTokenFromCookie(cookieHeader: string | undefined): string | null {
  const cookies = getCookieFromHeader(cookieHeader);
  return cookies[env.COOKIE_NAME] || null;
}
