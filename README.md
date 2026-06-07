# Sistem Peminjaman Barang Bengkel

Website untuk mengelola peminjaman barang/peralatan bengkel seperti kunci, obeng, bor, tang, mesin, alat ukur, dan perlengkapan praktik. Aplikasi memakai React Vite, Tailwind CSS, Supabase Auth/Database/Storage, dan siap dideploy ke Vercel.

## Fitur

- Authentication Supabase: login, register, logout, protected route.
- Role-based access: admin dan user/peminjam.
- Dashboard admin dengan statistik barang dan peminjaman.
- CRUD data barang bengkel, termasuk upload gambar ke Supabase Storage.
- Search dan filter barang berdasarkan nama, kategori, kode, dan status.
- Pengajuan peminjaman oleh user.
- Approval/reject oleh admin dengan catatan.
- Update stok otomatis saat approve dan return melalui RPC Supabase.
- Riwayat peminjaman admin dan riwayat pribadi user.
- Validasi form untuk stok, tanggal, jumlah pinjam, dan status barang.
- UI responsive dengan layout sidebar admin dan navbar user.

## Tech Stack

- Frontend: React JS + Vite
- Styling: Tailwind CSS
- Routing: react-router-dom
- Database/Auth/Storage: Supabase
- Deploy: Vercel
- Bahasa: JavaScript

## Instalasi

```bash
npm install
```

Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

Isi environment variable:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Jalankan lokal:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

## Setup Supabase

1. Buat project Supabase baru.
2. Buka Supabase SQL Editor.
3. Jalankan seluruh isi file `supabase/schema.sql`.
4. Pastikan Authentication email/password aktif.
5. Untuk admin, buat user dari Supabase Auth atau register dari aplikasi, lalu ubah role di SQL:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

6. Storage bucket `item-images` dibuat otomatis oleh schema. Jika ada error permission saat menjalankan SQL, buat bucket `item-images` manual dari Supabase Storage, set public, lalu jalankan ulang bagian policy storage.

## Alur Database

- `auth.users` menyimpan akun Supabase Auth.
- Trigger `handle_new_user` otomatis membuat data di `profiles`.
- `profiles.role` menentukan akses admin atau user.
- `items` menyimpan master data barang, stok, kondisi, status, lokasi, dan gambar.
- `borrowings` menyimpan pengajuan dan riwayat peminjaman.
- RPC `approve_borrowing` mengurangi `stok_tersedia` secara atomik.
- RPC `return_borrowing` menambah `stok_tersedia` dan mengubah status menjadi `returned`.
- RLS membatasi user agar hanya bisa melihat/membuat peminjaman miliknya, sementara admin dapat mengelola data.

## Struktur Folder

```text
src/
├── components/
├── context/
├── layouts/
├── lib/
├── pages/
│   ├── admin/
│   ├── auth/
│   └── user/
├── routes/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

## Deploy ke Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

File `vercel.json` sudah menyiapkan rewrite SPA ke `index.html`.

## Akun Demo

Akun demo tidak dibuat otomatis karena Supabase Auth menyimpan password di sistem auth, bukan di SQL schema publik. Rekomendasi:

- Admin: buat `admin@example.com`, lalu update role menjadi `admin`.
- User: register langsung dari halaman Register.
