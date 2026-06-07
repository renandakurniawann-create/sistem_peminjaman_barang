import {
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials } from "../utils/formatters.js";

const navItems = [
  { end: true, icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
  { icon: Package, label: "Data Barang", to: "/admin/items" },
  { icon: ClipboardList, label: "Data Peminjaman", to: "/admin/borrowings" },
  { icon: ClipboardCheck, label: "Approval", to: "/admin/approvals" },
];

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="rounded-lg bg-workshop-500 p-2.5 text-white">
          <Wrench className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-bold text-white">BengkelPinjam</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "bg-workshop-500 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
            end={item.end}
            key={item.to}
            onClick={onNavigate}
            to={item.to}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.full_name || user?.email || "Admin";

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 bg-navy-900 lg:block">
        <SidebarContent />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative h-full w-72 bg-navy-900 shadow-soft">
            <button
              aria-label="Tutup menu"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => setSidebarOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <button
              aria-label="Buka menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="hidden text-sm text-slate-500 sm:block">
              Panel pengelolaan barang dan peminjaman bengkel
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
                {getInitials(displayName)}
              </div>
              <Button icon={LogOut} onClick={handleLogout} size="sm" variant="secondary">
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
