'use client';

import { useState } from 'react';

// Single-series trend-over-time chart (dataviz skill: "trend over time → line;
// area for a single series"). One series in the app's own brand color —
// per the skill's series-count ladder, 1-3 series is comfortable in color
// alone, and a single series needs no legend box (the card title already
// names what's plotted). No categorical palette is introduced here, so the
// CVD validator (which checks *categorical* palettes) doesn't apply.
const LINE_COLOR = '#0F172A'; // trust-blue-900
const GRID_COLOR = '#E2E8F0'; // border-gray-200

const VIEW_W = 680;
const VIEW_H = 260;
const PAD_LEFT = 36;
const PAD_RIGHT = 16;
const PAD_TOP = 24;
const PAD_BOTTOM = 32;

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = Math.pow(10, exponent);
  const residual = value / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

function computeYAxis(maxValue: number): { max: number; ticks: number[] } {
  const raw = Math.max(maxValue, 1);
  if (raw <= 5) {
    return { max: raw, ticks: Array.from({ length: raw + 1 }, (_, i) => i) };
  }
  const step = niceCeil(raw / 4);
  const ticks: number[] = [];
  let t = 0;
  while (t < raw) {
    ticks.push(t);
    t += step;
  }
  ticks.push(t);
  return { max: t, ticks };
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, (m ?? 1) - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

export function ListingsOverTimeChart({ data }: { data: { month: string; count: number }[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  if (data.length === 0) {
    return <p className="body-md text-on-surface-variant">No listings yet — this fills in as you publish.</p>;
  }

  const { max, ticks } = computeYAxis(Math.max(...data.map((d) => d.count)));
  const plotW = VIEW_W - PAD_LEFT - PAD_RIGHT;
  const plotH = VIEW_H - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => ({
    ...d,
    x: PAD_LEFT + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2),
    y: PAD_TOP + plotH - (d.count / max) * plotH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + plotH} L ${points[0].x} ${PAD_TOP + plotH} Z`;

  // Hit-band width per point — wider than the visible dot, per the hover
  // spec ("hit target bigger than the mark").
  const bandWidth = data.length > 1 ? plotW / (data.length - 1) : plotW;
  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full" style={{ height: 260 }} preserveAspectRatio="none">
          {ticks.map((tick) => {
            const y = PAD_TOP + plotH - (tick / max) * plotH;
            return (
              <g key={tick}>
                <line x1={PAD_LEFT} x2={VIEW_W - PAD_RIGHT} y1={y} y2={y} stroke={GRID_COLOR} strokeWidth={1} />
                <text x={PAD_LEFT - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#45464d">
                  {tick.toLocaleString()}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={LINE_COLOR} opacity={0.1} />
          <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => (
            <g key={p.month}>
              <circle cx={p.x} cy={p.y} r={4} fill={LINE_COLOR} stroke="#ffffff" strokeWidth={2} />
              <text x={p.x} y={VIEW_H - 8} textAnchor="middle" fontSize={11} fill="#45464d">
                {formatMonth(p.month)}
              </text>
              {/* End label — value at the end, per marks-and-anatomy.md */}
              {i === points.length - 1 && (
                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill={LINE_COLOR}>
                  {p.count}
                </text>
              )}
              <rect
                x={p.x - bandWidth / 2}
                y={PAD_TOP}
                width={bandWidth}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onFocus={() => setHoverIndex(i)}
                onBlur={() => setHoverIndex(null)}
                tabIndex={0}
                role="img"
                aria-label={`${formatMonth(p.month)}: ${p.count} listing${p.count === 1 ? '' : 's'}`}
              />
            </g>
          ))}

          {hovered && (
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_TOP}
              y2={PAD_TOP + plotH}
              stroke={LINE_COLOR}
              strokeWidth={1}
              strokeOpacity={0.3}
            />
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border-gray-200 bg-surface-container-lowest px-3 py-2 text-label-sm shadow-md"
            style={{ left: `${(hovered.x / VIEW_W) * 100}%`, top: `${(hovered.y / VIEW_H) * 100 - 4}%` }}
          >
            <p className="font-bold text-on-surface">
              {hovered.count} listing{hovered.count === 1 ? '' : 's'}
            </p>
            <p className="text-on-surface-variant">{formatMonth(hovered.month)}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setTableOpen((v) => !v)}
        className="label-sm mt-2 text-on-surface-variant underline"
      >
        {tableOpen ? 'Hide' : 'View'} as table
      </button>
      {tableOpen && (
        <table className="mt-2 w-full text-left text-label-sm">
          <thead>
            <tr className="border-b border-border-gray-200 text-on-surface-variant">
              <th className="py-1">Month</th>
              <th className="py-1">Listings</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month} className="border-b border-border-gray-200 last:border-0">
                <td className="py-1 text-on-surface">{formatMonth(d.month)}</td>
                <td className="py-1 text-on-surface">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
