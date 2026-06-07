import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { borrowingService } from "../../services/borrowingService.js";
import { itemService } from "../../services/itemService.js";
import { addDaysInputValue, todayInputValue } from "../../utils/formatters.js";
import { validateBorrowingForm } from "../../utils/validators.js";

export default function BorrowForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    item_id: id,
    jumlah: 1,
    keperluan: "",
    tanggal_kembali_rencana: addDaysInputValue(1),
    tanggal_pinjam: todayInputValue(),
  });
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await itemService.getItemById(id);
        setItem(data);
      } catch (error) {
        toast.error(error.message || "Gagal memuat barang.");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateBorrowingForm(form, item);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Periksa kembali form pengajuan.");
      return;
    }

    setSubmitting(true);
    try {
      await borrowingService.createBorrowing(form);
      toast.success("Pengajuan peminjaman berhasil dikirim.");
      navigate("/my-borrowings");
    } catch (error) {
      toast.error(error.message || "Gagal mengirim pengajuan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (!item) return null;

  return (
    <>
      <PageHeader
        actions={
          <Button icon={ArrowLeft} onClick={() => navigate(`/items/${id}`)} variant="secondary">
            Kembali
          </Button>
        }
        description="Pengajuan akan masuk ke daftar approval admin sebelum barang dapat dipinjam."
        eyebrow="Form pengajuan"
        title="Ajukan Peminjaman"
      />

      <form className="grid gap-6 lg:grid-cols-[380px_1fr]" onSubmit={handleSubmit}>
        <aside className="panel overflow-hidden">
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
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{item.nama_barang}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {item.kode_barang} · {item.kategori}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Stok tersedia</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">
                {item.stok_tersedia}/{item.stok_total}
              </p>
            </div>
            {errors.item ? <p className="mt-3 text-sm text-red-600">{errors.item}</p> : null}
          </div>
        </aside>

        <section className="panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="jumlah">
                Jumlah pinjam
              </label>
              <input
                className="form-input"
                id="jumlah"
                max={item.stok_tersedia}
                min="1"
                name="jumlah"
                onChange={updateField}
                type="number"
                value={form.jumlah}
              />
              {errors.jumlah ? (
                <p className="mt-1 text-xs text-red-600">{errors.jumlah}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="tanggal_pinjam">
                Tanggal pinjam
              </label>
              <input
                className="form-input"
                id="tanggal_pinjam"
                name="tanggal_pinjam"
                onChange={updateField}
                type="date"
                value={form.tanggal_pinjam}
              />
              {errors.tanggal_pinjam ? (
                <p className="mt-1 text-xs text-red-600">{errors.tanggal_pinjam}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="tanggal_kembali_rencana">
                Tanggal kembali rencana
              </label>
              <input
                className="form-input"
                id="tanggal_kembali_rencana"
                name="tanggal_kembali_rencana"
                onChange={updateField}
                type="date"
                value={form.tanggal_kembali_rencana}
              />
              {errors.tanggal_kembali_rencana ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.tanggal_kembali_rencana}
                </p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="keperluan">
                Keperluan
              </label>
              <textarea
                className="form-textarea"
                id="keperluan"
                name="keperluan"
                onChange={updateField}
                placeholder="Contoh: Praktik pembuatan rangka meja di bengkel mesin"
                value={form.keperluan}
              />
              {errors.keperluan ? (
                <p className="mt-1 text-xs text-red-600">{errors.keperluan}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button icon={Send} loading={submitting} type="submit">
              Kirim pengajuan
            </Button>
          </div>
        </section>
      </form>
    </>
  );
}
