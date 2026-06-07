import { Filter, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/Button.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { borrowingService } from "../../services/borrowingService.js";
import { BORROWING_STATUS_OPTIONS } from "../../utils/constants.js";
import { formatDate } from "../../utils/formatters.js";

export default function MyBorrowings() {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnTarget, setReturnTarget] = useState(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadBorrowings() {
    setLoading(true);
    try {
      await borrowingService.markOverdueBorrowings();
      const data = await borrowingService.getBorrowings({ status, userId: user.id });
      setBorrowings(data);
    } catch (error) {
      toast.error(error.message || "Gagal memuat riwayat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrowings();
  }, [status, user.id]);

  async function handleReturn() {
    if (!returnTarget) return;

    setSubmitting(true);
    try {
      await borrowingService.returnBorrowing(returnTarget.id);
      toast.success("Barang berhasil dikembalikan.");
      setReturnTarget(null);
      await loadBorrowings();
    } catch (error) {
      toast.error(error.message || "Gagal mengembalikan barang.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        description="Lihat status pengajuan, catatan admin, dan riwayat pengembalian barang."
        eyebrow="Peminjam"
        title="Riwayat Peminjaman Saya"
      />

      <div className="panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filter status
        </div>
        <select
          className="form-select sm:max-w-xs"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="">Semua status</option>
          {BORROWING_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : borrowings.length === 0 ? (
        <EmptyState
          description="Pengajuan yang kamu kirim akan muncul di sini."
          title="Belum ada riwayat"
        />
      ) : (
        <div className="grid gap-4">
          {borrowings.map((borrowing) => {
            const canReturn = ["approved", "borrowed", "overdue"].includes(borrowing.status);
            return (
              <article className="panel p-5" key={borrowing.id}>
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-950">
                        {borrowing.item?.nama_barang || "-"}
                      </h2>
                      <StatusBadge status={borrowing.status} type="borrowing" />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {borrowing.jumlah} item · {formatDate(borrowing.tanggal_pinjam)} sampai{" "}
                      {formatDate(borrowing.tanggal_kembali_rencana)}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {borrowing.keperluan}
                    </p>
                    {borrowing.catatan_admin ? (
                      <div className="mt-3 rounded-lg bg-orange-50 p-3 text-sm text-orange-900">
                        <span className="font-semibold">Catatan admin:</span>{" "}
                        {borrowing.catatan_admin}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canReturn ? (
                      <Button
                        icon={RotateCcw}
                        onClick={() => setReturnTarget(borrowing)}
                        variant="secondary"
                      >
                        Kembalikan
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        confirmText="Kembalikan"
        loading={submitting}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturn}
        open={Boolean(returnTarget)}
        title="Kembalikan barang?"
      >
        Stok barang akan bertambah kembali setelah status pengembalian diproses.
      </ConfirmModal>
    </>
  );
}
