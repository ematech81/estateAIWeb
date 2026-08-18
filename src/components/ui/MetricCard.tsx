// Shared by the dashboard and the analytics page — one stat-tile definition
// so both stay visually consistent. Value is `null` while loading (renders
// "…"), never a fabricated placeholder number.
export function MetricCard({ icon, label, value }: { icon: string; label: string; value: number | null }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border-gray-200 bg-surface-container-lowest p-6">
      <div className="mb-4 w-fit rounded-lg bg-surface-container-low p-2 text-trust-blue-900">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="label-md text-on-surface-variant">{label}</p>
        <p className="headline-md mt-1 font-bold text-primary">{value ?? '…'}</p>
      </div>
    </div>
  );
}
