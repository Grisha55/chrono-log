import { useEffect, useState, type FormEvent } from "react";
import { useTimeTracker } from "../context/TimeTrackerContext";
import {
  getDurationSec,
  parseLocalDateTime,
  toLocalDateInput,
  toLocalTimeInput,
} from "../lib/time";
import type { TimeRecord } from "../types";

interface ManualEntryFormProps {
  editingRecord: TimeRecord | null;
  onSaved: () => void;
  onCancelEdit: () => void;
}

export function ManualEntryForm({ editingRecord, onSaved, onCancelEdit }: ManualEntryFormProps) {
  const { data, saveRecord } = useTimeTracker();
  const [category, setCategory] = useState(editingRecord?.category ?? data.categories[0] ?? "Other");
  const [description, setDescription] = useState(editingRecord?.description ?? "");
  const [date, setDate] = useState(
    editingRecord ? toLocalDateInput(new Date(editingRecord.startTime)) : toLocalDateInput(),
  );
  const [startTime, setStartTime] = useState(
    editingRecord ? toLocalTimeInput(new Date(editingRecord.startTime)) : "",
  );
  const [endTime, setEndTime] = useState(
    editingRecord ? toLocalTimeInput(new Date(editingRecord.endTime)) : "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategory(editingRecord?.category ?? data.categories[0] ?? "Other");
    setDescription(editingRecord?.description ?? "");
    setDate(editingRecord ? toLocalDateInput(new Date(editingRecord.startTime)) : toLocalDateInput());
    setStartTime(editingRecord ? toLocalTimeInput(new Date(editingRecord.startTime)) : "");
    setEndTime(editingRecord ? toLocalTimeInput(new Date(editingRecord.endTime)) : "");
    setError(null);
  }, [editingRecord, data.categories]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const start = parseLocalDateTime(date, startTime);
    const end = parseLocalDateTime(date, endTime);
    if (!start || !end) {
      setError("Enter a valid date and time.");
      return;
    }
    if (end.getTime() <= start.getTime()) {
      setError("End time must be after start time.");
      return;
    }

    const record: TimeRecord = {
      id: editingRecord?.id ?? crypto.randomUUID(),
      category,
      description: description.trim(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSec: getDurationSec(start.toISOString(), end.toISOString()),
    };
    const result = saveRecord(record);
    if (result) {
      setError(result);
      return;
    }
    setError(null);
    onSaved();
    if (!editingRecord) {
      setDescription("");
      setStartTime("");
      setEndTime("");
      setDate(toLocalDateInput());
    }
  }

  return (
    <section className="card" aria-labelledby="manual-heading">
      <div className="mb-5">
        <p className="eyebrow">FILL IN THE GAPS</p>
        <h2 id="manual-heading" className="section-title mt-1">
          {editingRecord ? "Edit entry" : "Add a past activity"}
        </h2>
      </div>
      <form className="grid gap-4" onSubmit={submit}>
        <div>
          <label htmlFor="entry-category" className="field-label">Category</label>
          <select
            id="entry-category"
            aria-label="Entry category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="field"
          >
            {data.categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="entry-description" className="field-label">Description <span className="font-normal text-muted">(optional)</span></label>
          <input
            id="entry-description"
            aria-label="Entry description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What did you do?"
            maxLength={120}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="entry-date" className="field-label">Date</label>
          <input
            id="entry-date"
            aria-label="Entry date"
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="field"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="entry-start" className="field-label">Start</label>
            <input
              id="entry-start"
              aria-label="Start time"
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="entry-end" className="field-label">End</label>
            <input
              id="entry-end"
              aria-label="End time"
              type="time"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="field"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="button-primary flex-1">
            {editingRecord ? "Save changes" : "Add entry"}
          </button>
          {editingRecord && (
            <button type="button" className="button-secondary" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
