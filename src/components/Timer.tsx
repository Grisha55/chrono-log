import { useEffect, useState } from "react";
import { useTimeTracker } from "../context/TimeTrackerContext";
import { formatDuration } from "../lib/time";

export function Timer() {
  const { data, startTimer, stopTimer } = useTimeTracker();
  const [category, setCategory] = useState(data.categories[0] ?? "Other");
  const [description, setDescription] = useState("");
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const activeTimer = data.activeTimer;

  useEffect(() => {
    if (!activeTimer) return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [activeTimer]);

  function toggleTimer() {
    const result = activeTimer
      ? stopTimer()
      : startTimer(category, description.trim());
    setError(result);
    if (!result && !activeTimer) setDescription("");
  }

  const elapsedSec = activeTimer
    ? Math.max(0, Math.floor((now - new Date(activeTimer.startTime).getTime()) / 1000))
    : 0;

  return (
    <section className="card overflow-hidden" aria-labelledby="timer-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">TRACK IN REAL TIME</p>
          <h2 id="timer-heading" className="section-title mt-1">Activity timer</h2>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${activeTimer ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />
      </div>

      {activeTimer ? (
        <div className="mt-7">
          <p className="text-sm font-semibold text-brand">
            {activeTimer.category}
            {activeTimer.description && <span className="font-normal text-muted"> · {activeTimer.description}</span>}
          </p>
          <p className="my-2 font-mono text-5xl font-semibold tracking-tight text-ink sm:text-6xl" aria-live="off">
            {formatDuration(elapsedSec)}
          </p>
          <p className="text-sm text-muted">
            Started at {new Date(activeTimer.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          <p className="text-sm text-muted" role="status">No timer is running.</p>
          <div>
            <label htmlFor="timer-category" className="field-label">Category</label>
            <select
              id="timer-category"
              aria-label="Timer category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field"
            >
              {data.categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="timer-description" className="field-label">What are you working on? <span className="font-normal text-muted">(optional)</span></label>
            <input
              id="timer-description"
              aria-label="Timer description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={120}
              placeholder="Add a short note"
              className="field"
            />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      <button
        type="button"
        aria-label={activeTimer ? "Stop timer" : "Start timer"}
        onClick={toggleTimer}
        className={`mt-6 w-full ${activeTimer ? "button-stop" : "button-primary"}`}
      >
        {activeTimer ? "Stop timer" : "Start timer"}
      </button>
      {!activeTimer && <p className="mt-3 text-center text-xs text-muted">Your timer keeps running if you close or reload this page.</p>}
    </section>
  );
}
