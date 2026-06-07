export function validateItemForm(values) {
  const errors = {};
  const total = Number(values.stok_total);
  const available = Number(values.stok_tersedia);

  if (!values.nama_barang?.trim()) errors.nama_barang = "Nama barang wajib diisi.";
  if (!values.kategori?.trim()) errors.kategori = "Kategori wajib diisi.";
  if (!values.kode_barang?.trim()) errors.kode_barang = "Kode barang wajib diisi.";
  if (!Number.isInteger(total) || total < 0) {
    errors.stok_total = "Stok total harus berupa angka 0 atau lebih.";
  }
  if (!Number.isInteger(available) || available < 0) {
    errors.stok_tersedia = "Stok tersedia harus berupa angka 0 atau lebih.";
  }
  if (Number.isInteger(total) && Number.isInteger(available) && available > total) {
    errors.stok_tersedia = "Stok tersedia tidak boleh melebihi stok total.";
  }
  if (!values.kondisi?.trim()) errors.kondisi = "Kondisi barang wajib diisi.";
  if (!values.status) errors.status = "Status barang wajib dipilih.";
  if (!values.lokasi_penyimpanan?.trim()) {
    errors.lokasi_penyimpanan = "Lokasi penyimpanan wajib diisi.";
  }

  return errors;
}

export function validateBorrowingForm(values, item) {
  const errors = {};
  const jumlah = Number(values.jumlah);

  if (!item) errors.item = "Barang tidak ditemukan.";
  if (!Number.isInteger(jumlah) || jumlah <= 0) {
    errors.jumlah = "Jumlah pinjam harus lebih dari 0.";
  }
  if (item && jumlah > Number(item.stok_tersedia)) {
    errors.jumlah = "Jumlah pinjam tidak boleh melebihi stok tersedia.";
  }
  if (item && ["rusak", "maintenance"].includes(item.status)) {
    errors.item = "Barang rusak atau maintenance tidak bisa dipinjam.";
  }
  if (item && item.status !== "tersedia") {
    errors.item = "Barang ini sedang tidak tersedia untuk dipinjam.";
  }
  if (!values.tanggal_pinjam) {
    errors.tanggal_pinjam = "Tanggal pinjam wajib diisi.";
  }
  if (!values.tanggal_kembali_rencana) {
    errors.tanggal_kembali_rencana = "Tanggal kembali rencana wajib diisi.";
  }
  if (
    values.tanggal_pinjam &&
    values.tanggal_kembali_rencana &&
    values.tanggal_kembali_rencana < values.tanggal_pinjam
  ) {
    errors.tanggal_kembali_rencana =
      "Tanggal kembali rencana tidak boleh sebelum tanggal pinjam.";
  }
  if (!values.keperluan?.trim()) errors.keperluan = "Keperluan wajib diisi.";

  return errors;
}
