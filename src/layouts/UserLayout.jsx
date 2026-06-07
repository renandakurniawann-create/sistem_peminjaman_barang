import { ClipboardList, Home, LogOut, Menu, PackageSearch, Wrench, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials } from "../utils/formatters.js";

const navItems = [
  { end: true, icon: Home, label: "Dashboard", to: "/" },
  { icon: PackageSearch, label: "Barang", to: "/items" },
  { icon: ClipboardList, label: "Riwayat Saya", to: "/my-borrowings" },
];

export default function UserLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.full_name || user?.email || "User";

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const navigation = (
    <nav className="flex flex-col gap-1 md:flex-row md:items-center">
      {navItems.map((item) => (
        <NavLink
          className={({ isActive }) =>
            [
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-navy-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            ].join(" ")
          }
          end={item.end}
          key={item.to}
          onClick={() => setMenuOpen(false)}
          to={item.to}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink className="flex items-center gap-3" to="/">
            <div className="rounded-lg bg-workshop-500 p-2.5 text-white">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-slate-950">BengkelPinjam</p>
              <p className="hidden text-xs text-slate-500 sm:block">Peminjaman alat</p>
            </div>
          </NavLink>

          <div className="hidden md:block">{navigation}</div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
            <Button icon={LogOut} onClick={handleLogout} size="sm" variant="secondary">
              Logout
            </Button>
          </div>

          <button
            aria-label="Buka menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[88vw] bg-white p-4 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
                  {getInitials(displayName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{displayName}</p>
                  <p className="text-xs text-slate-500">Peminjam</p>
                </div>
              </div>
              <button
                aria-label="Tutup menu"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                onClick={() => setMenuOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {navigation}
            <Button
              className="mt-6 w-full"
              icon={LogOut}
              onClick={handleLogout}
              variant="secondary"
            >
              Logout
            </Button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
