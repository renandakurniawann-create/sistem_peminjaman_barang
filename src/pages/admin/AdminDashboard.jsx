import {
  CheckCircle2,
  ClipboardList,
  Package,
  PackageCheck,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { borrowingService } from "../../services/borrowingService.js";
import { formatDate } from "../../utils/formatters.js";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState({
    activeBorrowings: 0,
    availableItems: 0,
    completedBorrowings: 0,
    pendingBorrowings: 0,
    totalItems: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statData, pendingData] = await Promise.all([
          borrowingService.getAdminStats(),
          borrowingService.getBorrowings({ limit: 5, status: "pending" }),
        ]);
        setStats(statData);
        setPending(pendingData);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <PageHeader
        description="Pantau stok alat, pengajuan terbaru, dan peminjaman aktif dari satu dashboard."
        eyebrow="Admin"
        title="Dashboard Bengkel"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Package} label="Total barang" value={stats.totalItems} />
        <StatCard
          helper="Status tersedia"
          icon={PackageCheck}
          label="Barang tersedia"
          tone="green"
          value={stats.availableItems}
        />
        <StatCard
          helper="Approved, borrowed, overdue"
          icon={ClipboardList}
          label="Sedang dipinjam"
          tone="blue"
          value={stats.activeBorrowings}
        />
        <StatCard
          icon={Timer}
          label="Menunggu approval"
          tone="orange"
          value={stats.pendingBorrowings}
        />
        <StatCard
          icon={CheckCircle2}
          label="Selesai"
          tone="green"
          value={stats.completedBorrowings}
        />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">Pengajuan terbaru</h2>
          <Link
            className="text-sm font-semibold text-workshop-600 hover:text-workshop-500"
            to="/admin/approvals"
          >
            Lihat semua
          </Link>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            description="Tidak ada pengajuan pending untuk saat ini."
            title="Pengajuan kosong"
          />
        ) : (
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-th">Barang</th>
                    <th className="table-th">Peminjam</th>
                    <th className="table-th">Jumlah</th>
                    <th className="table-th">Tanggal</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pending.map((borrowing) => (
                    <tr key={borrowing.id}>
                      <td className="table-td font-semibold text-slate-950">
                        {borrowing.item?.nama_barang || "-"}
                      </td>
                      <td className="table-td">
                        {borrowing.borrower?.full_name || borrowing.borrower?.email || "-"}
                      </td>
                      <td className="table-td">{borrowing.jumlah}</td>
                      <td className="table-td">
                        {formatDate(borrowing.tanggal_pinjam)}
                      </td>
                      <td className="table-td">
                        <StatusBadge status={borrowing.status} type="borrowing" />
                      </td>
                      <td className="table-td">
                        <Link
                          className="font-semibold text-workshop-600 hover:text-workshop-500"
                          to={`/admin/borrowings/${borrowing.id}`}
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
