import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { createInitialData, loadTrackerData, saveTrackerData } from "../lib/storage";
import { getDurationSec, getRecordConflict } from "../lib/time";
import type { Category, TimeRecord, TrackerData } from "../types";

type Action =
  | { type: "start-timer"; category: Category; description: string; startTime: string }
  | { type: "stop-timer"; record: TimeRecord }
  | { type: "save-record"; record: TimeRecord }
  | { type: "delete-record"; id: string }
  | { type: "add-category"; category: Category };

function reducer(state: TrackerData, action: Action): TrackerData {
  switch (action.type) {
    case "start-timer":
      return {
        ...state,
        activeTimer: {
          category: action.category,
          description: action.description,
          startTime: action.startTime,
        },
      };
    case "stop-timer":
      return {
        ...state,
        records: [...state.records, action.record],
        activeTimer: null,
      };
    case "save-record":
      return {
        ...state,
        records: [
          ...state.records.filter((record) => record.id !== action.record.id),
          action.record,
        ],
      };
    case "delete-record":
      return { ...state, records: state.records.filter((record) => record.id !== action.id) };
    case "add-category":
      return { ...state, categories: [...state.categories, action.category] };
  }
}

interface TimeTrackerContextValue {
  data: TrackerData;
  storageError: string | null;
  saveRecord: (record: TimeRecord) => string | null;
  deleteRecord: (id: string) => void;
  startTimer: (category: Category, description: string) => string | null;
  stopTimer: () => string | null;
  addCategory: (category: string) => string | null;
}

const TimeTrackerContext = createContext<TimeTrackerContextValue | null>(null);

export function TimeTrackerProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      return { data: loadTrackerData(), error: null as string | null };
    } catch (error) {
      return {
        data: createInitialData(),
        error: error instanceof Error ? error.message : "Unable to read saved ChronoLog data.",
      };
    }
  });
  const [data, dispatch] = useReducer(reducer, initial.data);
  const [storageError, setStorageError] = useState(initial.error);

  useEffect(() => {
    if (initial.error !== null) return;
    try {
      saveTrackerData(data);
      setStorageError(null);
    } catch (error) {
      setStorageError(
        error instanceof Error ? `Unable to save data: ${error.message}` : "Unable to save data.",
      );
    }
  }, [data, initial.error]);

  function saveRecord(record: TimeRecord): string | null {
    if (new Date(record.endTime).getTime() <= new Date(record.startTime).getTime()) {
      return "End time must be after start time.";
    }
    const conflict = getRecordConflict(record.startTime, record.endTime, data.records, record.id);
    if (conflict) return `This time overlaps with your ${conflict.category} entry.`;
    dispatch({ type: "save-record", record });
    return null;
  }

  function deleteRecord(id: string): void {
    dispatch({ type: "delete-record", id });
  }

  function startTimer(category: Category, description: string): string | null {
    if (data.activeTimer) return "A timer is already running. Stop it before starting another.";
    dispatch({
      type: "start-timer",
      category,
      description,
      startTime: new Date().toISOString(),
    });
    return null;
  }

  function stopTimer(): string | null {
    if (!data.activeTimer) return "There is no timer running.";
    const endTime = new Date().toISOString();
    const { activeTimer } = data;
    const conflict = getRecordConflict(activeTimer.startTime, endTime, data.records);
    if (conflict) {
      return `This timer overlaps with your ${conflict.category} entry. Edit or delete that entry, then stop the timer.`;
    }
    const record: TimeRecord = {
      id: crypto.randomUUID(),
      category: activeTimer.category,
      description: activeTimer.description,
      startTime: activeTimer.startTime,
      endTime,
      durationSec: getDurationSec(activeTimer.startTime, endTime),
    };
    dispatch({ type: "stop-timer", record });
    return null;
  }

  function addCategory(category: string): string | null {
    const normalized = category.trim();
    if (!normalized) return "Enter a category name.";
    if (data.categories.some((item) => item.toLocaleLowerCase() === normalized.toLocaleLowerCase())) {
      return "That category already exists.";
    }
    dispatch({ type: "add-category", category: normalized });
    return null;
  }

  return (
    <TimeTrackerContext.Provider
      value={{ data, storageError, saveRecord, deleteRecord, startTimer, stopTimer, addCategory }}
    >
      {children}
    </TimeTrackerContext.Provider>
  );
}

export function useTimeTracker(): TimeTrackerContextValue {
  const context = useContext(TimeTrackerContext);
  if (!context) throw new Error("useTimeTracker must be used within a TimeTrackerProvider.");
  return context;
}
