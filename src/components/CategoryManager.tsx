import { useState, type FormEvent } from "react";
import { useTimeTracker } from "../context/TimeTrackerContext";

export function CategoryManager() {
  const { addCategory } = useTimeTracker();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = addCategory(name);
    if (result) {
      setError(result);
      return;
    }
    setName("");
    setError(null);
  }

  return (
    <form className="flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={submit}>
      <div className="min-w-0 flex-1">
        <label htmlFor="new-category" className="mb-1.5 block text-xs font-semibold text-muted">
          Add a category
        </label>
        <input
          id="new-category"
          aria-label="New category name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          placeholder="e.g. Family"
          maxLength={32}
          className="field"
        />
        {error && <p className="mt-1 text-xs text-red-700" role="alert">{error}</p>}
      </div>
      <button className="button-secondary sm:mb-0" type="submit">Add category</button>
    </form>
  );
}
