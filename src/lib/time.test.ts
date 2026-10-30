import { describe, expect, it } from "vitest";
import {
  getCategoryTotals,
  getDurationSec,
  getRecordConflict,
  getTotalDuration,
  parseLocalDateTime,
} from "./time";
import type { TimeRecord } from "../types";

function record(
  id: string,
  start: Date,
  end: Date,
  category = "Work",
): TimeRecord {
  return {
    id,
    category,
    description: "",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    durationSec: getDurationSec(start.toISOString(), end.toISOString()),
  };
}

describe("time utilities", () => {
  it("rejects invalid and non-increasing manual date/time values", () => {
    const date = "2024-02-30";
    expect(parseLocalDateTime(date, "09:00")).toBeNull();
    expect(parseLocalDateTime("2024-02-01", "25:00")).toBeNull();
  });

  it("detects overlapping records while allowing adjacent time slots", () => {
    const day = new Date(2024, 0, 10);
    const existing = record(
      "existing",
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9),
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10),
    );

    expect(
      getRecordConflict(
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 30).toISOString(),
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 30).toISOString(),
        [existing],
      ),
    ).toBe(existing);
    expect(
      getRecordConflict(
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10).toISOString(),
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), 11).toISOString(),
        [existing],
      ),
    ).toBeUndefined();
  });

  it("excludes the record being edited from overlap checks", () => {
    const start = new Date(2024, 0, 10, 9);
    const end = new Date(2024, 0, 10, 10);
    const existing = record("same", start, end);

    expect(getRecordConflict(start.toISOString(), end.toISOString(), [existing], "same")).toBeUndefined();
  });

  it("calculates category totals and the overall tracked time", () => {
    const day = new Date(2024, 0, 10);
    const records = [
      record("a", new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9), new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10), "Work"),
      record("b", new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10), new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 30), "Study"),
      record("c", new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 30), new Date(day.getFullYear(), day.getMonth(), day.getDate(), 11), "Work"),
    ];

    expect(getCategoryTotals(records)).toEqual([
      { category: "Work", seconds: 5400 },
      { category: "Study", seconds: 1800 },
    ]);
    expect(getTotalDuration(records)).toBe(7200);
  });
});
