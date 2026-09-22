export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getYearMonthFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getPreviousYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

export function getNextYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}

export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
