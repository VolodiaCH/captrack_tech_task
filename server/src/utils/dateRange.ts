export function getYearMonth(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getMonthStart(yearMonth: string): Date {
  const [year, month] = yearMonth.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, 1);
}

export function getMonthEnd(yearMonth: string): Date {
  const [year, month] = yearMonth.split("-");
  return new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
}

export function getThisMonth(): string {
  return getYearMonth();
}

export function getLastMonth(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return getYearMonth(date);
}
