import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Belum ada data", description }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-lg bg-slate-100 p-3 text-slate-500">
        <Inbox className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-bold text-slate-950">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
