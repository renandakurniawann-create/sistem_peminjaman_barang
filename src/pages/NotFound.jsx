import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="panel max-w-md p-8 text-center">
        <p className="text-sm font-semibold text-workshop-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Alamat yang kamu buka tidak tersedia di sistem peminjaman bengkel.
        </p>
        <Button as={Link} className="mt-6" icon={Home} to="/">
          Ke dashboard
        </Button>
      </section>
    </main>
  );
}
