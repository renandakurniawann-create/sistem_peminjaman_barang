import { ArrowLeft, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { itemService } from "../../services/itemService.js";
import { formatDateTime } from "../../utils/formatters.js";

export default function AdminItemDetail() {
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

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button icon={ArrowLeft} onClick={() => navigate("/admin/items")} variant="secondary">
              Kembali
            </Button>
            <Button icon={Edit} onClick={() => navigate(`/admin/items/${item.id}/edit`)}>
              Edit
            </Button>
          </>
        }
        description="Detail master barang dan kondisi stok saat ini."
        eyebrow="Admin"
        title={item.nama_barang}
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
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

        <div className="panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Detail label="Kode barang" value={item.kode_barang} />
            <Detail label="Kategori" value={item.kategori} />
            <Detail label="Stok total" value={item.stok_total} />
            <Detail label="Stok tersedia" value={item.stok_tersedia} />
            <Detail label="Kondisi" value={item.kondisi} />
            <div>
              <p className="text-sm font-semibold text-slate-500">Status</p>
              <div className="mt-2">
                <StatusBadge status={item.status} />
              </div>
            </div>
            <Detail label="Lokasi" value={item.lokasi_penyimpanan} />
            <Detail label="Dibuat" value={formatDateTime(item.created_at)} />
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-slate-500">Deskripsi</p>
              <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {item.deskripsi || "Tidak ada deskripsi."}
              </p>
            </div>
          </div>
        </div>
      </div>
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
