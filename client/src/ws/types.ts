export type BudgetStatusMessage = {
  type: "budget_status";
  yearMonth: string;
  hasBudget: boolean;
  budget: number;
  spent: number;
  remaining: number;
  usagePct: number;
};

export type ThresholdAlertMessage = {
  type: "threshold_alert";
  yearMonth: string;
  threshold: 50 | 80 | 100;
  spent: number;
  budget: number;
  usagePct: number;
  firedAt: string;
  replay: boolean;
};

export type ClientMessage =
  | {
      type: "subscribe";
      yearMonth: string;
    }
  | {
      type: "acknowledge_alert";
      yearMonth: string;
      threshold: 50 | 80 | 100;
    };

export type ServerMessage = BudgetStatusMessage | ThresholdAlertMessage;
