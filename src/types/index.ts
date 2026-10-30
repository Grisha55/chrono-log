export const PRESET_CATEGORIES = [
  "Work",
  "Study",
  "Leisure",
  "Sport",
  "Sleep",
  "Other",
] as const;

export type Category = string;

export interface TimeRecord {
  id: string;
  category: Category;
  description: string;
  startTime: string;
  endTime: string;
  durationSec: number;
}

export interface ActiveTimer {
  category: Category;
  description: string;
  startTime: string;
}

export interface TrackerData {
  records: TimeRecord[];
  categories: Category[];
  activeTimer: ActiveTimer | null;
}
