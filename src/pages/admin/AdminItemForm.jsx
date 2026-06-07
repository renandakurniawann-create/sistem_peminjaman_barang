import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { itemService } from "../../services/itemService.js";
import {
  CONDITION_OPTIONS,
  ITEM_STATUS_OPTIONS,
} from "../../utils/constants.js";
import { validateItemForm } from "../../utils/validators.js";

const emptyForm = {
  deskripsi: "",
  gambar_url: "",
  kategori: "",
  kode_barang: "",
  kondisi: "Baik",
  lokasi_penyimpanan: "",
  nama_barang: "",
  status: "tersedia",
  stok_tersedia: 0,
  stok_total: 0,
};

export default function AdminItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return form.gambar_url;
  }, [form.gambar_url, imageFile]);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryData, itemData] = await Promise.all([
          itemService.getCategories(),
          isEdit ? itemService.getItemById(id) : Promise.resolve(null),
        ]);
        setCategories(categoryData);
        if (itemData) {
          setForm({
            deskripsi: itemData.deskripsi || "",
            gambar_url: itemData.gambar_url || "",
            kategori: itemData.kategori || "",
            kode_barang: itemData.kode_barang || "",
            kondisi: itemData.kondisi || "Baik",
            lokasi_penyimpanan: itemData.lokasi_penyimpanan || "",
            nama_barang: itemData.nama_barang || "",
            status: itemData.status || "tersedia",
            stok_tersedia: itemData.stok_tersedia ?? 0,
            stok_total: itemData.stok_total ?? 0,
          });
        }
      } catch (error) {
        toast.error(error.message || "Gagal memuat data barang.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEdit]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => {
      const next = { ...current, [name]: value };
      if (!isEdit && name === "stok_total") {
        next.stok_tersedia = value;
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateItemForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Periksa kembali form barang.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = form.gambar_url;
      if (imageFile) {
        imageUrl = await itemService.uploadItemImage(imageFile);
      }

      const payload = {
        ...form,
        gambar_url: imageUrl,
      };

      if (isEdit) {
        await itemService.updateItem(id, payload);
        toast.success("Barang berhasil diperbarui.");
      } else {
        await itemService.createItem(payload);
        toast.success("Barang berhasil ditambahkan.");
      }

      navigate("/admin/items");
    } catch (error) {
      toast.error(error.message || "Gagal menyimpan barang.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <>
      <PageHeader
        actions={
          <Button icon={ArrowLeft} onClick={() => navigate("/admin/items")} variant="secondary">
            Kembali
          </Button>
        }
        description="Isi data barang dengan lengkap agar stok dan lokasi mudah dilacak."
        eyebrow="Admin"
        title={isEdit ? "Edit Barang" : "Tambah Barang"}
      />

      <form className="grid gap-6 xl:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="nama_barang">
                Nama barang
              </label>
              <input
                className="form-input"
                id="nama_barang"
                name="nama_barang"
                onChange={updateField}
                placeholder="Contoh: Kunci Pas 12 mm"
                value={form.nama_barang}
              />
              {errors.nama_barang ? (
                <p className="mt-1 text-xs text-red-600">{errors.nama_barang}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="kode_barang">
                Kode barang
              </label>
              <input
                className="form-input"
                id="kode_barang"
                name="kode_barang"
                onChange={updateField}
                placeholder="BRG-001"
                value={form.kode_barang}
              />
              {errors.kode_barang ? (
                <p className="mt-1 text-xs text-red-600">{errors.kode_barang}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="kategori">
                Kategori
              </label>
              <input
                className="form-input"
                id="kategori"
                list="category-options"
                name="kategori"
                onChange={updateField}
                placeholder="Kunci, Obeng, Bor"
                value={form.kategori}
              />
              <datalist id="category-options">
                {categories.map((category) => (
                  <option key={category.id} value={category.nama_kategori} />
                ))}
              </datalist>
              {errors.kategori ? (
                <p className="mt-1 text-xs text-red-600">{errors.kategori}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="stok_total">
                Stok total
              </label>
              <input
                className="form-input"
                id="stok_total"
                min="0"
                name="stok_total"
                onChange={updateField}
                type="number"
                value={form.stok_total}
              />
              {errors.stok_total ? (
                <p className="mt-1 text-xs text-red-600">{errors.stok_total}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="stok_tersedia">
                Stok tersedia
              </label>
              <input
                className="form-input"
                id="stok_tersedia"
                min="0"
                name="stok_tersedia"
                onChange={updateField}
                type="number"
                value={form.stok_tersedia}
              />
              {errors.stok_tersedia ? (
                <p className="mt-1 text-xs text-red-600">{errors.stok_tersedia}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="kondisi">
                Kondisi
              </label>
              <select
                className="form-select"
                id="kondisi"
                name="kondisi"
                onChange={updateField}
                value={form.kondisi}
              >
                {CONDITION_OPTIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              {errors.kondisi ? (
                <p className="mt-1 text-xs text-red-600">{errors.kondisi}</p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="status">
                Status
              </label>
              <select
                className="form-select"
                id="status"
                name="status"
                onChange={updateField}
                value={form.status}
              >
                {ITEM_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status ? (
                <p className="mt-1 text-xs text-red-600">{errors.status}</p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="lokasi_penyimpanan">
                Lokasi penyimpanan
              </label>
              <input
                className="form-input"
                id="lokasi_penyimpanan"
                name="lokasi_penyimpanan"
                onChange={updateField}
                placeholder="Rak A-1 / Lemari alat ukur"
                value={form.lokasi_penyimpanan}
              />
              {errors.lokasi_penyimpanan ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lokasi_penyimpanan}
                </p>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="deskripsi">
                Deskripsi
              </label>
              <textarea
                className="form-textarea"
                id="deskripsi"
                name="deskripsi"
                onChange={updateField}
                placeholder="Catatan spesifikasi atau penggunaan alat"
                value={form.deskripsi}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-base font-bold text-slate-950">Gambar barang</h2>
            <div className="mt-4 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              {imagePreview ? (
                <img
                  alt="Preview barang"
                  className="h-full w-full object-cover"
                  src={imagePreview}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                  Belum ada gambar
                </div>
              )}
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              <UploadCloud className="h-4 w-4" aria-hidden="true" />
              Upload gambar
              <input
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                type="file"
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Format yang disarankan: PNG, JPG, atau WebP. File disimpan ke bucket
              Supabase Storage <span className="font-semibold">item-images</span>.
            </p>
          </div>

          <Button className="w-full" icon={Save} loading={submitting} type="submit">
            {isEdit ? "Simpan perubahan" : "Simpan barang"}
          </Button>
        </aside>
      </form>
    </>
  );
}
