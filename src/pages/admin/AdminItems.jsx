import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { itemService } from "../../services/itemService.js";
import { ITEM_STATUS_OPTIONS } from "../../utils/constants.js";

export default function AdminItems() {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function loadItems() {
    setLoading(true);
    try {
      const data = await itemService.getItems(filters);
      setItems(data);
    } catch (error) {
      toast.error(error.message || "Gagal memuat barang.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [filters.search, filters.status]);

  function updateFilter(event) {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      await itemService.deleteItem(deleteTarget.id);
      toast.success("Barang berhasil dihapus.");
      setDeleteTarget(null);
      await loadItems();
    } catch (error) {
      toast.error(error.message || "Gagal menghapus barang.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        actions={
          <Button icon={Plus} onClick={() => navigate("/admin/items/new")}>
            Tambah barang
          </Button>
        }
        description="Kelola master data barang, stok, status, lokasi, dan gambar alat bengkel."
        eyebrow="Admin"
        title="Data Barang"
      />

      <div className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_220px]">
        <label className="relative">
          <span className="sr-only">Cari barang</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="form-input pl-10"
            name="search"
            onChange={updateFilter}
            placeholder="Cari nama, kategori, atau kode barang"
            value={filters.search}
          />
        </label>
        <select
          className="form-select"
          name="status"
          onChange={updateFilter}
          value={filters.status}
        >
          <option value="">Semua status</option>
          {ITEM_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : items.length === 0 ? (
        <EmptyState
          description="Coba ubah kata kunci atau tambahkan barang baru."
          title="Barang tidak ditemukan"
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Barang</th>
                  <th className="table-th">Kode</th>
                  <th className="table-th">Kategori</th>
                  <th className="table-th">Stok</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Lokasi</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
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
                        <div>
                          <p className="font-semibold text-slate-950">{item.nama_barang}</p>
                          <p className="text-xs text-slate-500">{item.kondisi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">{item.kode_barang}</td>
                    <td className="table-td">{item.kategori}</td>
                    <td className="table-td">
                      {item.stok_tersedia}/{item.stok_total}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="table-td">{item.lokasi_penyimpanan}</td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="px-2.5"
                          icon={Eye}
                          onClick={() => navigate(`/admin/items/${item.id}`)}
                          size="sm"
                          variant="secondary"
                        />
                        <Button
                          className="px-2.5"
                          icon={Edit}
                          onClick={() => navigate(`/admin/items/${item.id}/edit`)}
                          size="sm"
                          variant="secondary"
                        />
                        <Button
                          className="px-2.5"
                          icon={Trash2}
                          onClick={() => setDeleteTarget(item)}
                          size="sm"
                          variant="danger"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        confirmText="Hapus"
        danger
        loading={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        open={Boolean(deleteTarget)}
        title="Hapus barang?"
      >
        Barang <strong>{deleteTarget?.nama_barang}</strong> akan dihapus dari master
        data. Data yang sudah dipakai di riwayat peminjaman mungkin tidak bisa dihapus
        karena relasi database.
      </ConfirmModal>
    </>
  );
}
