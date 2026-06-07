# Langkah Menyambungkan Project ke Supabase

Panduan ini khusus untuk project Sistem Peminjaman Barang Bengkel. Project sudah menyiapkan client Supabase di `src/lib/supabaseClient.js` dan schema database di `supabase/schema.sql`.

## 1. Buat Project Supabase

1. Buka `https://supabase.com`.
2. Login atau buat akun Supabase.
3. Klik **New project**.
4. Pilih organization.
5. Isi nama project, misalnya `sistem-peminjaman-bengkel`.
6. Buat database password yang kuat dan simpan password tersebut.
7. Pilih region terdekat.
8. Klik **Create new project** dan tunggu sampai project siap.

## 2. Ambil URL dan API Key

1. Masuk ke dashboard project Supabase.
2. Buka menu **Project Settings**.
3. Buka bagian **API**.
4. Salin **Project URL**.
5. Salin **anon public key** atau **publishable key**.
6. Jangan gunakan `service_role` key di frontend karena key tersebut bisa melewati Row Level Security.

## 3. Buat File `.env`

Di root project, buat file `.env` berdasarkan `.env.example`.

```bash
copy .env.example .env
```

Jika memakai PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi file `.env` seperti ini:

```env
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=ISI_DENGAN_ANON_PUBLIC_ATAU_PUBLISHABLE_KEY
```

Contoh:

```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Setelah mengubah `.env`, restart development server.

## 4. Jalankan SQL Schema

1. Buka dashboard Supabase.
2. Masuk ke menu **SQL Editor**.
3. Klik **New query**.
4. Buka file `supabase/schema.sql` di project ini.
5. Copy semua isi file tersebut.
6. Paste ke SQL Editor Supabase.
7. Klik **Run**.

Schema tersebut akan membuat:

- Tabel `profiles`
- Tabel `categories`
- Tabel `items`
- Tabel `borrowings`
- Trigger auto-create profile dari Supabase Auth
- Row Level Security policies
- Function/RPC untuk approve, reject, borrowed, return, dan overdue
- Storage bucket `item-images`
- Storage policies untuk upload gambar barang

## 5. Aktifkan Auth Email dan Password

1. Di dashboard Supabase, buka **Authentication**.
2. Masuk ke **Providers**.
3. Pastikan provider **Email** aktif.
4. Untuk testing lokal, kamu boleh menonaktifkan email confirmation agar register langsung bisa login.
5. Untuk production, email confirmation lebih aman jika diaktifkan.

Jika email confirmation aktif, user harus verifikasi email dulu sebelum bisa login.

## 6. Buat Akun Admin

Ada dua cara.

Cara paling mudah:

1. Jalankan aplikasi lokal.
2. Register akun admin dari halaman Register.
3. Buka Supabase **SQL Editor**.
4. Jalankan query berikut, ganti email sesuai akun admin:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

Cara lewat Supabase:

1. Buka **Authentication**.
2. Buka **Users**.
3. Klik **Add user**.
4. Isi email dan password.
5. Jalankan query update role seperti di atas.

## 7. Jalankan Project Lokal

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka URL yang muncul, biasanya:

```text
http://localhost:5173
```

Jika koneksi Supabase berhasil:

- Warning konfigurasi Supabase tidak muncul lagi.
- Register user bisa membuat akun.
- Data user muncul di tabel `profiles`.
- Admin bisa menambah barang.
- User bisa mengajukan peminjaman.

Route login aplikasi:

- Admin: `/admin/login`
- User: `/login`

## 8. Test Alur Aplikasi

1. Register akun user biasa.
2. Register atau buat akun admin.
3. Ubah role admin di tabel `profiles`.
4. Login sebagai admin.
5. Tambahkan data barang di menu **Data Barang**.
6. Login sebagai user.
7. Buka **Daftar Barang**.
8. Ajukan peminjaman barang.
9. Login kembali sebagai admin.
10. Buka **Approval Peminjaman**.
11. Approve pengajuan.
12. Pastikan `stok_tersedia` barang berkurang.
13. Login sebagai user dan lakukan pengembalian.
14. Pastikan `stok_tersedia` barang bertambah kembali.

## 9. Isi Data Dummy

Project menyediakan file dummy data di `supabase/seed.sql`.

Sebelum menjalankan seed, buat 3 user berikut di **Authentication > Users**:

```text
admin.bengkel@example.com
siswa.praktik@example.com
siswa.las@example.com
```

Password bebas untuk testing. Contoh:

```text
Admin123456
User123456
```

Setelah user dibuat:

1. Buka **SQL Editor**.
2. Klik **New query**.
3. Copy semua isi `supabase/seed.sql`.
4. Paste ke SQL Editor.
5. Klik **Run**.

Seed akan mengisi:

- `profiles`
- `categories`
- `items`
- `borrowings`

## 10. Setup Environment Variable di Vercel

Saat deploy ke Vercel:

1. Buka dashboard Vercel.
2. Pilih project.
3. Buka **Settings**.
4. Masuk ke **Environment Variables**.
5. Tambahkan:

```env
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=ISI_DENGAN_ANON_PUBLIC_ATAU_PUBLISHABLE_KEY
```

6. Deploy ulang project setelah env ditambahkan.

Build setting:

```text
Build Command: npm run build
Output Directory: dist
```

## 11. Troubleshooting

Jika muncul warning Supabase belum dikonfigurasi:

- Pastikan file `.env` ada di root project.
- Pastikan nama env diawali `VITE_`.
- Restart `npm run dev`.

Jika register berhasil tapi data profile tidak muncul:

- Pastikan `supabase/schema.sql` sudah dijalankan sampai selesai.
- Cek trigger `on_auth_user_created`.
- Cek tabel `profiles`.

Jika admin tidak bisa akses dashboard admin:

- Cek role di tabel `profiles`.
- Pastikan nilainya `admin`, bukan `Admin` atau `administrator`.

Jika upload gambar gagal:

- Pastikan bucket `item-images` ada di Supabase Storage.
- Pastikan bucket public.
- Pastikan storage policies dari `supabase/schema.sql` sudah dijalankan.
- Pastikan user yang upload memiliki role `admin`.

Jika user tidak bisa melihat atau membuat data:

- Pastikan user sudah login.
- Pastikan RLS policies sudah dibuat.
- Pastikan menggunakan anon public key atau publishable key, bukan service role key.
