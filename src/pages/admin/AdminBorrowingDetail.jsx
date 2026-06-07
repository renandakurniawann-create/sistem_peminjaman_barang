import { ArrowLeft, CheckCircle2, PackageCheck, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { borrowingService } from "../../services/borrowingService.js";
import { formatDate, formatDateTime } from "../../utils/formatters.js";

const actionMeta = {
  approve: {
    confirmText: "Approve",
    icon: CheckCircle2,
    title: "Setujui pengajuan?",
  },
  reject: {
    confirmText: "Reject",
    danger: true,
    icon: XCircle,
    title: "Tolak pengajuan?",
  },
  borrowed: {
    confirmText: "Tandai dipinjam",
    icon: PackageCheck,
    title: "Tandai barang sudah dipinjam?",
  },
  return: {
    confirmText: "Kembalikan",
    icon: RotateCcw,
    title: "Konfirmasi pengembalian?",
  },
};

export default function AdminBorrowingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState(null);
  const [borrowing, setBorrowing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadBorrowing() {
    setLoading(true);
    try {
      await borrowingService.markOverdueBorrowings();
      const data = await borrowingService.getBorrowingById(id);
      setBorrowing(data);
    } catch (error) {
      toast.error(error.message || "Gagal memuat detail peminjaman.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrowing();
  }, [id]);

  const availableActions = useMemo(() => {
    if (!borrowing) return [];

    const actions = [];
    if (borrowing.status === "pending") {
      actions.push("approve", "reject");
    }
    if (borrowing.status === "approved") {
      actions.push("borrowed");
    }
    if (["approved", "borrowed", "overdue"].includes(borrowing.status)) {
      actions.push("return");
    }
    return actions;
  }, [borrowing]);

  function openAction(type) {
    setNote("");
    setAction(type);
  }

  async function handleAction() {
    if (!action || !borrowing) return;
    if (action === "reject" && !note.trim()) {
      toast.error("Catatan admin wajib diisi saat reject.");
      return;
    }

    setSubmitting(true);
    try {
      if (action === "approve") {
        await borrowingService.approveBorrowing(borrowing.id, note);
      }
      if (action === "reject") {
        await borrowingService.rejectBorrowing(borrowing.id, note);
      }
      if (action === "borrowed") {
        await borrowingService.markBorrowed(borrowing.id);
      }
      if (action === "return") {
        await borrowingService.returnBorrowing(borrowing.id);
      }

      toast.success("Status peminjaman berhasil diperbarui.");
      setAction(null);
      await loadBorrowing();
    } catch (error) {
      toast.error(error.message || "Gagal memproses peminjaman.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (!borrowing) return null;

  const currentAction = action ? actionMeta[action] : null;

  return (
    <>
      <PageHeader
        actions={
          <Button icon={ArrowLeft} onClick={() => navigate("/admin/borrowings")} variant="secondary">
            Kembali
          </Button>
        }
        description="Periksa detail pengajuan dan proses approval atau pengembalian."
        eyebrow="Admin"
        title="Detail Peminjaman"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="panel p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">Barang</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {borrowing.item?.nama_barang || "-"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {borrowing.item?.kode_barang || "-"} · {borrowing.item?.kategori || "-"}
                </p>
              </div>
              <StatusBadge status={borrowing.status} type="borrowing" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Detail label="Peminjam" value={borrowing.borrower?.full_name || "-"} />
              <Detail label="Email" value={borrowing.borrower?.email || "-"} />
              <Detail label="Jumlah" value={borrowing.jumlah} />
              <Detail label="Tanggal pinjam" value={formatDate(borrowing.tanggal_pinjam)} />
              <Detail
                label="Rencana kembali"
                value={formatDate(borrowing.tanggal_kembali_rencana)}
              />
              <Detail
                label="Kembali aktual"
                value={formatDate(borrowing.tanggal_kembali_aktual)}
              />
              <Detail label="Diajukan" value={formatDateTime(borrowing.created_at)} />
              <Detail label="Lokasi barang" value={borrowing.item?.lokasi_penyimpanan || "-"} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <TextBlock label="Keperluan" value={borrowing.keperluan} />
              <TextBlock label="Catatan admin" value={borrowing.catatan_admin} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="panel p-5">
            <h2 className="text-base font-bold text-slate-950">Aksi status</h2>
            {availableActions.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Tidak ada aksi lanjutan untuk status ini.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {availableActions.map((type) => {
                  const meta = actionMeta[type];
                  return (
                    <Button
                      className="w-full"
                      icon={meta.icon}
                      key={type}
                      onClick={() => openAction(type)}
                      variant={meta.danger ? "danger" : type === "return" ? "secondary" : "primary"}
                    >
                      {meta.confirmText}
                    </Button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="text-base font-bold text-slate-950">Stok barang</h2>
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tersedia / total</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">
                {borrowing.item?.stok_tersedia ?? 0}/{borrowing.item?.stok_total ?? 0}
              </p>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmModal
        confirmText={currentAction?.confirmText}
        danger={currentAction?.danger}
        loading={submitting}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        open={Boolean(action)}
        title={currentAction?.title}
      >
        {action === "approve" || action === "reject" ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Catatan admin {action === "approve" ? "(opsional)" : ""}
            </span>
            <textarea
              className="form-textarea"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Tulis catatan untuk peminjam"
              value={note}
            />
          </label>
        ) : (
          <span>Status transaksi akan diperbarui dan stok barang disesuaikan.</span>
        )}
      </ConfirmModal>
    </>
  );
}

function Detail({ label, value }) {
  const displayValue = value === null || value === undefined || value === "" ? "-" : value;

  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{displayValue}</p>
    </div>
  );
}

function TextBlock({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}
