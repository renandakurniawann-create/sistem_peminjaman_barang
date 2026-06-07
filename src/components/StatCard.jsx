export default function StatCard({ icon: Icon, label, value, helper, tone = "navy" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 text-workshop-600"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-600"
        : tone === "blue"
          ? "bg-sky-50 text-sky-600"
          : "bg-navy-50 text-navy-700";

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-lg p-3 ${toneClass}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
