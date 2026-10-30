import { lazy, Suspense, useMemo } from "react";
import { getCategoryTotals, getDateKey, getTotalDuration, formatDuration } from "../lib/time";
import type { TimeRecord } from "../types";
import { RecordList } from "./RecordList";

const CategoryChart = lazy(() =>
  import("./CategoryChart").then((module) => ({ default: module.CategoryChart })),
);

interface DayReportProps {
  date: string;
  onDateChange: (date: string) => void;
  records: TimeRecord[];
  onEdit: (record: TimeRecord) => void;
  onDelete: (id: string) => void;
}

export function DayReport({ date, onDateChange, records, onEdit, onDelete }: DayReportProps) {
  const dayRecords = useMemo(
    () => records.filter((record) => getDateKey(record.startTime) === date),
    [date, records],
  );
  const categoryTotals = getCategoryTotals(dayRecords);
  const total = getTotalDuration(dayRecords);
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="space-y-5" aria-labelledby="report-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">YOUR DAY, IN PERSPECTIVE</p>
          <h2 id="report-heading" className="section-title mt-1">Daily report</h2>
          <p className="mt-1 text-sm text-muted">{dateLabel}</p>
        </div>
        <div>
          <label htmlFor="report-date" className="sr-only">Choose report date</label>
          <input
            id="report-date"
            aria-label="Report date"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="field sm:w-48"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card bg-gradient-to-br from-brand to-indigo-700 text-white">
          <p className="text-sm font-medium text-indigo-100">Total tracked</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatDuration(total)}</p>
          <p className="mt-1 text-sm text-indigo-100">{dayRecords.length} {dayRecords.length === 1 ? "activity" : "activities"}</p>
        </div>
        <div className="card">
          <p className="mb-3 text-sm font-medium text-muted">Time by category</p>
          {categoryTotals.length === 0 ? (
            <p className="py-3 text-sm text-muted">No time logged yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {categoryTotals.map(({ category, seconds }) => (
                <li key={category} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink">{category}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink">{formatDuration(seconds)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <section className="card" aria-labelledby="activities-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 id="activities-heading" className="text-base font-semibold text-ink">Activities</h3>
            <span className="text-xs text-muted">{dayRecords.length} total</span>
          </div>
          <RecordList records={dayRecords} onEdit={onEdit} onDelete={onDelete} />
        </section>
        <section className="card" aria-labelledby="chart-heading">
          <h3 id="chart-heading" className="text-base font-semibold text-ink">Time distribution</h3>
          <Suspense fallback={<p className="py-8 text-center text-sm text-muted">Loading chart...</p>}>
            <CategoryChart records={dayRecords} />
          </Suspense>
        </section>
      </div>
    </section>
  );
}
