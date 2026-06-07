import { Eye, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { borrowingService } from "../../services/borrowingService.js";
import { BORROWING_STATUS_OPTIONS } from "../../utils/constants.js";
import { formatDate } from "../../utils/formatters.js";

export default function AdminBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  async function loadBorrowings() {
    setLoading(true);
    try {
      await borrowingService.markOverdueBorrowings();
      const data = await borrowingService.getBorrowings({ status });
      setBorrowings(data);
    } catch (error) {
      toast.error(error.message || "Gagal memuat data peminjaman.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrowings();
  }, [status]);

  return (
    <>
      <PageHeader
        description="Pantau semua pengajuan, peminjaman aktif, penolakan, dan pengembalian barang."
        eyebrow="Admin"
        title="Data Peminjaman"
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
        <EmptyState title="Belum ada peminjaman" />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Barang</th>
                  <th className="table-th">Peminjam</th>
                  <th className="table-th">Jumlah</th>
                  <th className="table-th">Pinjam</th>
                  <th className="table-th">Rencana kembali</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {borrowings.map((borrowing) => (
                  <tr key={borrowing.id}>
                    <td className="table-td font-semibold text-slate-950">
                      {borrowing.item?.nama_barang || "-"}
                    </td>
                    <td className="table-td">
                      {borrowing.borrower?.full_name || borrowing.borrower?.email || "-"}
                    </td>
                    <td className="table-td">{borrowing.jumlah}</td>
                    <td className="table-td">{formatDate(borrowing.tanggal_pinjam)}</td>
                    <td className="table-td">
                      {formatDate(borrowing.tanggal_kembali_rencana)}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={borrowing.status} type="borrowing" />
                    </td>
                    <td className="table-td">
                      <Button
                        icon={Eye}
                        onClick={() => navigate(`/admin/borrowings/${borrowing.id}`)}
                        size="sm"
                        variant="secondary"
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
