import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";

export default function ConfigNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-none" aria-hidden="true" />
        Isi <span className="font-semibold">VITE_SUPABASE_URL</span> dan{" "}
        <span className="font-semibold">VITE_SUPABASE_ANON_KEY</span> agar aplikasi
        terhubung ke Supabase.
      </div>
    </div>
  );
}
