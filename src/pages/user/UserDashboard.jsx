import { ClipboardList, Clock3, PackageSearch, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { borrowingService } from "../../services/borrowingService.js";
import { itemService } from "../../services/itemService.js";
import { formatDate } from "../../utils/formatters.js";

export default function UserDashboard() {
  const { profile, user } = useAuth();
  const [activeBorrowings, setActiveBorrowings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    rejected: 0,
    returned: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        await borrowingService.markOverdueBorrowings();
        const [statData, borrowingData, itemData] = await Promise.all([
          borrowingService.getUserStats(user.id),
          borrowingService.getBorrowings({ limit: 5, userId: user.id }),
          itemService.getItems({ limit: 4, onlyBorrowable: true }),
        ]);

        setStats(statData);
        setActiveBorrowings(
          borrowingData.filter((borrowing) =>
            ["approved", "borrowed", "overdue", "pending"].includes(borrowing.status)
          )
        );
        setItems(itemData);
      } catch (error) {
        toast.error(error.message || "Gagal memuat dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user.id]);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <PageHeader
        actions={
          <Button icon={PackageSearch} onClick={() => navigate("/items")}>
            Lihat barang
          </Button>
        }
        description="Pantau status pengajuan, peminjaman aktif, dan barang yang bisa dipinjam."
        eyebrow={`Halo, ${profile?.full_name || user.email}`}
        title="Dashboard Peminjam"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock3} label="Menunggu" tone="orange" value={stats.pending} />
        <StatCard icon={ClipboardList} label="Aktif" tone="blue" value={stats.active} />
        <StatCard icon={RotateCcw} label="Dikembalikan" tone="green" value={stats.returned} />
        <StatCard icon={XCircle} label="Ditolak" value={stats.rejected} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Status terbaru</h2>
            <Link
              className="text-sm font-semibold text-workshop-600 hover:text-workshop-500"
              to="/my-borrowings"
            >
              Riwayat lengkap
            </Link>
          </div>
          {activeBorrowings.length === 0 ? (
            <EmptyState
              description="Belum ada pengajuan atau peminjaman aktif."
              title="Tidak ada aktivitas"
            />
          ) : (
            <div className="panel divide-y divide-slate-100">
              {activeBorrowings.map((borrowing) => (
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={borrowing.id}>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {borrowing.item?.nama_barang || "-"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {borrowing.jumlah} item · kembali {formatDate(borrowing.tanggal_kembali_rencana)}
                    </p>
                  </div>
                  <StatusBadge status={borrowing.status} type="borrowing" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Barang tersedia</h2>
            <Link
              className="text-sm font-semibold text-workshop-600 hover:text-workshop-500"
              to="/items"
            >
              Semua
            </Link>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                className="panel flex items-center gap-3 p-3 transition hover:border-workshop-500"
                key={item.id}
                to={`/items/${item.id}`}
              >
                <div className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                  {item.gambar_url ? (
                    <img
                      alt={item.nama_barang}
                      className="h-full w-full object-cover"
                      src={item.gambar_url}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                      IMG
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{item.nama_barang}</p>
                  <p className="text-sm text-slate-500">
                    Stok {item.stok_tersedia}/{item.stok_total}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
