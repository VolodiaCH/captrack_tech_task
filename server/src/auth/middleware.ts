import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "./jwt.js";
import { getTokenFromCookie } from "./cookie.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getTokenFromCookie(req.headers.cookie);

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = payload;
  next();
}
