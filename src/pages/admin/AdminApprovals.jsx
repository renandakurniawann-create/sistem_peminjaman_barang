import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { borrowingService } from "../../services/borrowingService.js";
import { formatDate } from "../../utils/formatters.js";

export default function AdminApprovals() {
  const [action, setAction] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function loadApprovals() {
    setLoading(true);
    try {
      const data = await borrowingService.getBorrowings({ status: "pending" });
      setBorrowings(data);
    } catch (error) {
      toast.error(error.message || "Gagal memuat approval.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  function openAction(type, borrowing) {
    setNote("");
    setAction({ borrowing, type });
  }

  async function handleAction() {
    if (!action) return;
    if (action.type === "reject" && !note.trim()) {
      toast.error("Catatan admin wajib diisi saat reject.");
      return;
    }

    setSubmitting(true);
    try {
      if (action.type === "approve") {
        await borrowingService.approveBorrowing(action.borrowing.id, note);
        toast.success("Pengajuan berhasil disetujui.");
      } else {
        await borrowingService.rejectBorrowing(action.borrowing.id, note);
        toast.success("Pengajuan berhasil ditolak.");
      }
      setAction(null);
      await loadApprovals();
    } catch (error) {
      toast.error(error.message || "Gagal memproses approval.");
    } finally {
      setSubmitting(false);
    }
  }

  const isReject = action?.type === "reject";

  return (
    <>
      <PageHeader
        description="Setujui atau tolak pengajuan peminjaman yang masih menunggu keputusan admin."
        eyebrow="Admin"
        title="Approval Peminjaman"
      />

      {loading ? (
        <LoadingScreen />
      ) : borrowings.length === 0 ? (
        <EmptyState
          description="Semua pengajuan sudah diproses."
          title="Tidak ada pengajuan pending"
        />
      ) : (
        <div className="grid gap-4">
          {borrowings.map((borrowing) => (
            <div className="panel p-5" key={borrowing.id}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-950">
                      {borrowing.item?.nama_barang || "-"}
                    </h2>
                    <StatusBadge status={borrowing.status} type="borrowing" />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {borrowing.borrower?.full_name || borrowing.borrower?.email || "-"} ·{" "}
                    {borrowing.jumlah} item · {formatDate(borrowing.tanggal_pinjam)} sampai{" "}
                    {formatDate(borrowing.tanggal_kembali_rencana)}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {borrowing.keperluan}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    icon={Eye}
                    onClick={() => navigate(`/admin/borrowings/${borrowing.id}`)}
                    variant="secondary"
                  >
                    Detail
                  </Button>
                  <Button
                    icon={CheckCircle2}
                    onClick={() => openAction("approve", borrowing)}
                  >
                    Approve
                  </Button>
                  <Button
                    icon={XCircle}
                    onClick={() => openAction("reject", borrowing)}
                    variant="danger"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        confirmText={isReject ? "Reject" : "Approve"}
        danger={isReject}
        loading={submitting}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        open={Boolean(action)}
        title={isReject ? "Tolak pengajuan?" : "Setujui pengajuan?"}
      >
        <div>
          <p className="mb-3">
            {action?.borrowing?.item?.nama_barang} untuk{" "}
            {action?.borrowing?.borrower?.full_name ||
              action?.borrowing?.borrower?.email ||
              "peminjam"}
          </p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Catatan admin {isReject ? "" : "(opsional)"}
            </span>
            <textarea
              className="form-textarea"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Tulis catatan untuk peminjam"
              value={note}
            />
          </label>
        </div>
      </ConfirmModal>
    </>
  );
}
