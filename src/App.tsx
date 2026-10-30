import { useState } from "react";
import { CategoryManager } from "./components/CategoryManager";
import { DayReport } from "./components/DayReport";
import { ManualEntryForm } from "./components/ManualEntryForm";
import { Timer } from "./components/Timer";
import { TimeTrackerProvider, useTimeTracker } from "./context/TimeTrackerContext";
import { toLocalDateInput } from "./lib/time";
import type { TimeRecord } from "./types";

function ChronoLogApp() {
  const { data, storageError, deleteRecord } = useTimeTracker();
  const [reportDate, setReportDate] = useState(toLocalDateInput());
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);

  function handleDelete(id: string) {
    deleteRecord(id);
    if (editingRecord?.id === id) setEditingRecord(null);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" aria-label="ChronoLog home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white" aria-hidden="true">C</span>
            <span className="text-lg font-bold tracking-tight text-ink">Chrono<span className="text-brand">Log</span></span>
          </a>
          <p className="hidden text-sm text-muted sm:block">A clearer picture of your time</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">MAKE EVERY HOUR VISIBLE</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Your time, understood.</h1>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
            Track what you do as it happens, then look back at the shape of your day.
          </p>
        </div>

        {storageError && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
            {storageError} Your changes may not persist between visits.
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.5fr)]">
          <div className="space-y-5">
            <Timer />
            <section className="card" aria-labelledby="categories-heading">
              <p className="eyebrow">MAKE IT YOURS</p>
              <h2 id="categories-heading" className="section-title mb-4 mt-1">Categories</h2>
              <CategoryManager />
            </section>
            <ManualEntryForm
              key={editingRecord?.id ?? "new-entry"}
              editingRecord={editingRecord}
              onSaved={() => setEditingRecord(null)}
              onCancelEdit={() => setEditingRecord(null)}
            />
          </div>

          <DayReport
            date={reportDate}
            onDateChange={setReportDate}
            records={data.records}
            onEdit={(record) => {
              setEditingRecord(record);
              setReportDate(toLocalDateInput(new Date(record.startTime)));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDelete={handleDelete}
          />
        </div>
        <footer className="mt-10 border-t border-line pt-5 text-center text-xs text-muted">
          Your data stays in this browser, stored locally on this device.
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TimeTrackerProvider>
      <ChronoLogApp />
    </TimeTrackerProvider>
  );
}
