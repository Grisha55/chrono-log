import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatDuration } from "../lib/time";
import type { TimeRecord } from "../types";

const COLORS = ["#5146e5", "#0f9f8f", "#f59e0b", "#e76f51", "#5681d8", "#9b59b6", "#64748b"];

export function CategoryChart({ records }: { records: TimeRecord[] }) {
  const totals = new Map<string, number>();
  for (const record of records) {
    totals.set(record.category, (totals.get(record.category) ?? 0) + record.durationSec);
  }
  const data = [...totals.entries()].map(([name, seconds]) => ({ name, seconds }));

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Your category breakdown will appear here.</p>;
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="Pie chart showing time spent in each category">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="seconds"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={48}
            outerRadius={78}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatDuration(Number(value))} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
