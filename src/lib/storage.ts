import { PRESET_CATEGORIES, type ActiveTimer, type TimeRecord, type TrackerData } from "../types";

const STORAGE_KEY = "chronolog-data";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isTimeRecord(value: unknown): value is TimeRecord {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.category === "string" &&
    typeof value.description === "string" &&
    isValidDate(value.startTime) &&
    isValidDate(value.endTime) &&
    typeof value.durationSec === "number" &&
    Number.isFinite(value.durationSec) &&
    value.durationSec >= 0
  );
}

function isActiveTimer(value: unknown): value is ActiveTimer {
  return (
    isObject(value) &&
    typeof value.category === "string" &&
    typeof value.description === "string" &&
    isValidDate(value.startTime)
  );
}

function isTrackerData(value: unknown): value is TrackerData {
  return (
    isObject(value) &&
    Array.isArray(value.records) &&
    value.records.every(isTimeRecord) &&
    Array.isArray(value.categories) &&
    value.categories.every((category: unknown) => typeof category === "string") &&
    (value.activeTimer === null || isActiveTimer(value.activeTimer))
  );
}

export function createInitialData(): TrackerData {
  return {
    records: [],
    categories: [...PRESET_CATEGORIES],
    activeTimer: null,
  };
}

export function loadTrackerData(): TrackerData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return createInitialData();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    throw new Error("Saved ChronoLog data is not valid JSON.");
  }
  if (!isTrackerData(parsed)) {
    throw new Error("Saved ChronoLog data has an invalid format.");
  }
  return parsed;
}

export function saveTrackerData(data: TrackerData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
