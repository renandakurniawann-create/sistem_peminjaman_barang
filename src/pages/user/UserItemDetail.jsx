import { ArrowLeft, ClipboardPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { itemService } from "../../services/itemService.js";

export default function UserItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await itemService.getItemById(id);
        setItem(data);
      } catch (error) {
        toast.error(error.message || "Gagal memuat detail barang.");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!item) return null;

  const canBorrow = item.status === "tersedia" && item.stok_tersedia > 0;
  const disabledReason =
    item.status === "rusak" || item.status === "maintenance"
      ? "Barang rusak atau maintenance tidak bisa dipinjam."
      : item.stok_tersedia <= 0
        ? "Stok barang sedang habis."
        : item.status !== "tersedia"
          ? "Barang sedang tidak tersedia."
          : "";

  return (
    <>
      <PageHeader
        actions={
          <Button icon={ArrowLeft} onClick={() => navigate("/items")} variant="secondary">
            Kembali
          </Button>
        }
        description="Pastikan stok dan status barang sebelum mengajukan peminjaman."
        eyebrow="Detail barang"
        title={item.nama_barang}
      />

      <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
        <div className="panel overflow-hidden">
          <div className="aspect-[4/3] bg-slate-100">
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
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Kode barang</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{item.kode_barang}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail label="Kategori" value={item.kategori} />
              <Detail label="Kondisi" value={item.kondisi} />
              <Detail label="Stok tersedia" value={`${item.stok_tersedia}/${item.stok_total}`} />
              <Detail label="Lokasi" value={item.lokasi_penyimpanan} />
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-500">Deskripsi</p>
              <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {item.deskripsi || "Tidak ada deskripsi."}
              </p>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-base font-bold text-slate-950">Ajukan peminjaman</h2>
            {disabledReason ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">{disabledReason}</p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Isi jumlah, tanggal, dan keperluan untuk mengirim pengajuan ke admin.
              </p>
            )}
            <Button
              className="mt-4"
              disabled={!canBorrow}
              icon={ClipboardPlus}
              onClick={() => navigate(`/items/${item.id}/borrow`)}
            >
              Ajukan peminjaman
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value || "-"}</p>
    </div>
  );
}
