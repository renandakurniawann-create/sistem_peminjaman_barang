import { Wrench } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthLayout() {
  const { loading, profile, user } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate replace to={profile?.role === "admin" ? "/admin" : "/"} />;

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="hidden bg-navy-900 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-3">
            <div className="rounded-lg bg-workshop-500 p-3">
              <Wrench className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold">BengkelPinjam</p>
              <p className="text-sm text-slate-300">Sistem peminjaman peralatan</p>
            </div>
          </div>
          <div className="mt-16 max-w-lg">
            <h1 className="text-4xl font-bold leading-tight">
              Kelola alat bengkel, approval, dan riwayat dalam satu tempat.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-300">
              Dibuat untuk admin bengkel dan peminjam agar stok, status, serta
              pengembalian barang selalu terlacak dengan rapi.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">CRUD Barang</p>
            <p className="mt-1">Data alat lengkap</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Approval</p>
            <p className="mt-1">Stok otomatis</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Riwayat</p>
            <p className="mt-1">Transaksi tercatat</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="rounded-lg bg-workshop-500 p-3 text-white">
              <Wrench className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950">BengkelPinjam</p>
              <p className="text-sm text-slate-500">Sistem peminjaman peralatan</p>
            </div>
          </div>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
