import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { itemService } from "../../services/itemService.js";
import { ITEM_STATUS_OPTIONS } from "../../utils/constants.js";

export default function UserItems() {
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    loadItems();
  }, [filters.search, filters.status]);

  function updateFilter(event) {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  return (
    <>
      <PageHeader
        description="Cari alat bengkel yang tersedia, lihat detail stok, lalu ajukan peminjaman."
        eyebrow="Peminjam"
        title="Daftar Barang"
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
          description="Coba kata kunci lain atau hubungi admin bengkel."
          title="Barang tidak ditemukan"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const canBorrow = item.status === "tersedia" && item.stok_tersedia > 0;
            return (
              <article className="panel overflow-hidden" key={item.id}>
                <Link className="block aspect-[4/3] bg-slate-100" to={`/items/${item.id}`}>
                  {item.gambar_url ? (
                    <img
                      alt={item.nama_barang}
                      className="h-full w-full object-cover"
                      src={item.gambar_url}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                      Tidak ada gambar
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        className="text-lg font-bold text-slate-950 hover:text-workshop-600"
                        to={`/items/${item.id}`}
                      >
                        {item.nama_barang}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.kode_barang} · {item.kategori}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">
                      Stok {item.stok_tersedia}/{item.stok_total}
                    </p>
                    <Button
                      disabled={!canBorrow}
                      onClick={() => navigate(`/items/${item.id}/borrow`)}
                      size="sm"
                    >
                      Pinjam
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
