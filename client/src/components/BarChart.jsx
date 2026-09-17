import React from 'react';

// Minimal, dependency-free horizontal bar chart for admin statistics.
// data: [{ label, value }]
export default function BarChart({ data, color = '#0d8aff', unit = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No data available.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">{d.label}</span>
            <span>{d.value}{unit}</span>
          </div>
          <div className="mt-1 h-2.5 w-full rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
