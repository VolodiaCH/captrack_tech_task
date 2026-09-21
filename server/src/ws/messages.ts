import { z } from "zod";

export const subscribeMessageSchema = z.object({
  type: z.literal("subscribe"),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
});

export const acknowledgeAlertMessageSchema = z.object({
  type: z.literal("acknowledge_alert"),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
  threshold: z.number().int(),
});

export const clientMessageSchema = z.union([subscribeMessageSchema, acknowledgeAlertMessageSchema]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

export interface BudgetStatusMessage {
  type: "budget_status";
  yearMonth: string;
  hasBudget: boolean;
  budget?: number;
  spent: number;
  remaining?: number;
  usagePct?: number;
}

export interface ThresholdAlertMessage {
  type: "threshold_alert";
  yearMonth: string;
  threshold: number;
  spent: number;
  budget: number;
  usagePct: number;
  firedAt: string;
  replay: boolean;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage = BudgetStatusMessage | ThresholdAlertMessage | ErrorMessage;
