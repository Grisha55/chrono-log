import { beforeEach, describe, expect, it } from "vitest";
import { createInitialData, loadTrackerData, saveTrackerData } from "./storage";

describe("local storage", () => {
  beforeEach(() => localStorage.clear());

  it("restores an active timer after reload from its persisted start time", () => {
    const data = createInitialData();
    const timerStartedAt = new Date(2024, 5, 12, 9, 15).toISOString();
    data.activeTimer = {
      category: "Study",
      description: "Read a chapter",
      startTime: timerStartedAt,
    };
    saveTrackerData(data);

    expect(loadTrackerData().activeTimer).toEqual(data.activeTimer);
  });

  it("returns preset categories when no saved data exists", () => {
    expect(loadTrackerData()).toEqual(createInitialData());
  });

  it("reports corrupted saved JSON instead of silently replacing it", () => {
    localStorage.setItem("chronolog-data", "{");
    expect(() => loadTrackerData()).toThrow("not valid JSON");
  });
});
