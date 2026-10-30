import type { TimeRecord } from "../types";

export function toLocalDateInput(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toLocalTimeInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function parseLocalDateTime(date: string, time: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const [, yearText, monthText, dayText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null;
  }

  return parsed;
}

export function getDateKey(isoDate: string): string {
  return toLocalDateInput(new Date(isoDate));
}

export function getDurationSec(startTime: string, endTime: string): number {
  return Math.max(
    0,
    Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000),
  );
}

export function formatDuration(durationSec: number): string {
  const seconds = Math.max(0, Math.floor(durationSec));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${remainingSeconds}s`;
}

export function getRecordConflict(
  startTime: string,
  endTime: string,
  records: TimeRecord[],
  ignoreId?: string,
): TimeRecord | undefined {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return undefined;
  const dateKey = getDateKey(startTime);

  return records.find((record) => {
    if (record.id === ignoreId || getDateKey(record.startTime) !== dateKey) return false;
    const existingStart = new Date(record.startTime).getTime();
    const existingEnd = new Date(record.endTime).getTime();
    return start < existingEnd && end > existingStart;
  });
}

export function getCategoryTotals(
  records: TimeRecord[],
): { category: string; seconds: number }[] {
  const totals = new Map<string, number>();
  for (const record of records) {
    totals.set(record.category, (totals.get(record.category) ?? 0) + record.durationSec);
  }
  return [...totals.entries()]
    .map(([category, seconds]) => ({ category, seconds }))
    .sort((a, b) => b.seconds - a.seconds);
}

export function getTotalDuration(records: TimeRecord[]): number {
  return records.reduce((total, record) => total + record.durationSec, 0);
}

export function sortRecordsByStart(records: TimeRecord[]): TimeRecord[] {
  return [...records].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}
