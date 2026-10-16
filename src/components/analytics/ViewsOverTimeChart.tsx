'use client';

import { useState } from 'react';

// Daily views as a single-series bar chart in the app's brand color (one
// series, so no legend or categorical palette is needed — the card title
// names what's plotted). Bars have a hover/focus readout and a table
// fallback for keyboard and screen-reader users.
const BAR_COLOR = '#0F172A'; // trust-blue-900
const CHART_HEIGHT = 160;

function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ViewsOverTimeChart({ data }: { data: { date: string; views: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  const max = Math.max(1, ...data.map((d) => d.views));
  const hovered = hover != null ? data[hover] : null;
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <div>
      <div className="mb-2 h-5 label-sm text-on-surface-variant">
        {hovered ? (
          <>
            <span className="font-bold text-on-surface">
              {hovered.views} view{hovered.views === 1 ? '' : 's'}
            </span>{' '}
            · {formatDay(hovered.date)}
          </>
        ) : (
          'Hover a bar for the day’s views'
        )}
      </div>

      <div className="flex items-end gap-[2px] border-b border-border-gray-200" style={{ height: CHART_HEIGHT }}>
        {data.map((d, i) => (
          <div
            key={d.date}
            className="flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            role="img"
            aria-label={`${formatDay(d.date)}: ${d.views} view${d.views === 1 ? '' : 's'}`}
          >
            <div
              className="w-full rounded-t-sm"
              style={{
                height: d.views === 0 ? 2 : `${(d.views / max) * 100}%`,
                backgroundColor: BAR_COLOR,
                opacity: d.views === 0 ? 0.15 : hover === i ? 1 : 0.8,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-1 flex gap-[2px]">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center label-sm text-on-surface-variant">
            {i % labelEvery === 0 ? <span className="whitespace-nowrap">{formatDay(d.date)}</span> : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setTableOpen((v) => !v)}
        className="label-sm mt-3 text-on-surface-variant underline"
      >
        {tableOpen ? 'Hide' : 'View'} as table
      </button>
      {tableOpen && (
        <table className="mt-2 w-full text-left text-label-sm">
          <thead>
            <tr className="border-b border-border-gray-200 text-on-surface-variant">
              <th className="py-1">Day</th>
              <th className="py-1">Views</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-b border-border-gray-200 last:border-0">
                <td className="py-1 text-on-surface">{formatDay(d.date)}</td>
                <td className="py-1 text-on-surface">{d.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
