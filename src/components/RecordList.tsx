import { formatDuration, sortRecordsByStart } from "../lib/time";
import type { TimeRecord } from "../types";

interface RecordListProps {
  records: TimeRecord[];
  onEdit: (record: TimeRecord) => void;
  onDelete: (id: string) => void;
}

export function RecordList({ records, onEdit, onDelete }: RecordListProps) {
  const sortedRecords = sortRecordsByStart(records);

  if (sortedRecords.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-slate-50 px-5 py-10 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm" aria-hidden="true">◷</span>
        <p className="font-semibold text-ink">No entries for this day yet</p>
        <p className="mt-1 text-sm text-muted">Start a timer or add an activity manually to see your day take shape.</p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-line">
      {sortedRecords.map((record) => (
        <li key={record.id} className="flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">
                {record.description || record.category}
                {record.description && <span className="ml-2 text-xs font-medium text-muted">{record.category}</span>}
              </p>
              <p className="mt-1 text-sm text-muted">
                {new Date(record.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" – "}
                {new Date(record.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pl-5 sm:justify-end sm:pl-0">
            <span className="text-sm font-semibold tabular-nums text-ink">{formatDuration(record.durationSec)}</span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label={`Edit ${record.category} entry`}
                onClick={() => onEdit(record)}
                className="icon-button"
              >
                Edit
              </button>
              <button
                type="button"
                aria-label={`Delete ${record.category} entry`}
                onClick={() => onDelete(record.id)}
                className="icon-button text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
