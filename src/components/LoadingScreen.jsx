import { Loader2 } from "lucide-react";

export default function LoadingScreen({ label = "Memuat data..." }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-soft">
        <Loader2 className="h-5 w-5 animate-spin text-workshop-500" />
        {label}
      </div>
    </div>
  );
}
