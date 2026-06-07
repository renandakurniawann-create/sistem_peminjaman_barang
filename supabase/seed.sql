-- Dummy data Sistem Peminjaman Barang Bengkel
-- Jalankan setelah supabase/schema.sql.
--
-- Penting:
-- 1. Buat user berikut dulu di Supabase Authentication > Users:
--    - admin.bengkel@example.com
--    - siswa.praktik@example.com
--    - siswa.las@example.com
-- 2. Password bebas, contoh untuk testing:
--    - Admin123456 untuk admin
--    - User123456 untuk user
-- 3. Setelah user dibuat, jalankan seluruh file ini di SQL Editor.

insert into public.categories (id, nama_kategori)
values
  ('11111111-1111-4111-8111-111111111111', 'Kunci'),
  ('11111111-1111-4111-8111-111111111112', 'Obeng'),
  ('11111111-1111-4111-8111-111111111113', 'Bor'),
  ('11111111-1111-4111-8111-111111111114', 'Tang'),
  ('11111111-1111-4111-8111-111111111115', 'Mesin'),
  ('11111111-1111-4111-8111-111111111116', 'Alat Ukur'),
  ('11111111-1111-4111-8111-111111111117', 'Perlengkapan Praktik')
on conflict (nama_kategori) do update
set updated_at = now();

insert into public.items (
  id,
  nama_barang,
  kategori,
  kode_barang,
  stok_total,
  stok_tersedia,
  kondisi,
  status,
  lokasi_penyimpanan,
  deskripsi,
  gambar_url
)
values
  (
    '22222222-2222-4222-8222-222222222201',
    'Kunci Pas 12 mm',
    'Kunci',
    'KNC-012',
    12,
    8,
    'Baik',
    'tersedia',
    'Rak Kunci A-01',
    'Kunci pas ukuran 12 mm untuk praktik otomotif dan perakitan ringan.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    'Set Obeng Plus Minus',
    'Obeng',
    'OBG-SET-001',
    20,
    15,
    'Baik',
    'tersedia',
    'Lemari Alat B-02',
    'Set obeng plus dan minus berbagai ukuran untuk praktik dasar bengkel.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    'Bor Tangan Listrik',
    'Bor',
    'BOR-TGN-001',
    6,
    3,
    'Baik',
    'tersedia',
    'Rak Mesin C-01',
    'Bor tangan listrik untuk pengeboran kayu, plat tipis, dan material praktik.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222204',
    'Tang Kombinasi',
    'Tang',
    'TNG-KMB-001',
    10,
    6,
    'Baik',
    'tersedia',
    'Rak Tang A-04',
    'Tang kombinasi untuk memegang, memotong, dan membengkokkan kabel atau kawat.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222205',
    'Multimeter Digital',
    'Alat Ukur',
    'UKR-MTR-001',
    8,
    5,
    'Baik',
    'tersedia',
    'Lemari Alat Ukur D-01',
    'Multimeter digital untuk mengukur tegangan, arus, dan resistansi.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222206',
    'Gerinda Tangan',
    'Mesin',
    'MSN-GRD-001',
    5,
    2,
    'Cukup baik',
    'tersedia',
    'Rak Mesin C-03',
    'Gerinda tangan untuk pemotongan dan penghalusan material praktik.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222207',
    'Mesin Las SMAW',
    'Mesin',
    'MSN-LAS-001',
    3,
    1,
    'Baik',
    'tersedia',
    'Area Las E-01',
    'Mesin las SMAW untuk praktik pengelasan dasar.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222208',
    'Jangka Sorong Digital',
    'Alat Ukur',
    'UKR-JSD-001',
    10,
    7,
    'Baik',
    'tersedia',
    'Lemari Alat Ukur D-02',
    'Jangka sorong digital untuk pengukuran presisi benda kerja.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222209',
    'Palu Besi 500 Gram',
    'Perlengkapan Praktik',
    'PLU-BSI-500',
    15,
    15,
    'Baik',
    'tersedia',
    'Rak Perkakas A-06',
    'Palu besi 500 gram untuk praktik kerja bangku.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222210',
    'Kompresor Angin',
    'Mesin',
    'MSN-KMP-001',
    2,
    0,
    'Perlu pengecekan',
    'maintenance',
    'Ruang Mesin C-05',
    'Kompresor angin sedang dalam jadwal pengecekan tekanan dan selang.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222211',
    'Bor Duduk',
    'Bor',
    'BOR-DDK-001',
    1,
    0,
    'Baik',
    'dipinjam',
    'Area Mesin C-02',
    'Bor duduk untuk pengeboran presisi pada benda kerja.',
    null
  ),
  (
    '22222222-2222-4222-8222-222222222212',
    'Solder Listrik 60 Watt',
    'Perlengkapan Praktik',
    'SLD-060-001',
    12,
    0,
    'Rusak ringan',
    'rusak',
    'Meja Elektronika F-01',
    'Beberapa solder perlu penggantian mata solder dan kabel.',
    null
  )
on conflict (kode_barang) do update
set nama_barang = excluded.nama_barang,
    kategori = excluded.kategori,
    stok_total = excluded.stok_total,
    stok_tersedia = excluded.stok_tersedia,
    kondisi = excluded.kondisi,
    status = excluded.status,
    lokasi_penyimpanan = excluded.lokasi_penyimpanan,
    deskripsi = excluded.deskripsi,
    gambar_url = excluded.gambar_url,
    updated_at = now();

do $$
declare
  admin_id uuid;
  user_praktik_id uuid;
  user_las_id uuid;
begin
  select id into admin_id
  from auth.users
  where email = 'admin.bengkel@example.com';

  select id into user_praktik_id
  from auth.users
  where email = 'siswa.praktik@example.com';

  select id into user_las_id
  from auth.users
  where email = 'siswa.las@example.com';

  if admin_id is null or user_praktik_id is null or user_las_id is null then
    raise exception
      'Buat user auth terlebih dahulu: admin.bengkel@example.com, siswa.praktik@example.com, siswa.las@example.com';
  end if;

  begin
    alter table public.profiles disable trigger profiles_prevent_non_admin_role_change;

    insert into public.profiles (id, full_name, email, role)
    values
      (admin_id, 'Admin Bengkel', 'admin.bengkel@example.com', 'admin'),
      (user_praktik_id, 'Siswa Praktik Mesin', 'siswa.praktik@example.com', 'user'),
      (user_las_id, 'Siswa Praktik Las', 'siswa.las@example.com', 'user')
    on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        role = excluded.role,
        updated_at = now();

    alter table public.profiles enable trigger profiles_prevent_non_admin_role_change;
  exception
    when others then
      alter table public.profiles enable trigger profiles_prevent_non_admin_role_change;
      raise;
  end;

  insert into public.borrowings (
    id,
    user_id,
    item_id,
    jumlah,
    tanggal_pinjam,
    tanggal_kembali_rencana,
    tanggal_kembali_aktual,
    keperluan,
    status,
    catatan_admin,
    created_at
  )
  values
    (
      '33333333-3333-4333-8333-333333333301',
      user_praktik_id,
      (select id from public.items where kode_barang = 'KNC-012'),
      2,
      current_date,
      current_date + 3,
      null,
      'Praktik pembongkaran dan pemasangan komponen kendaraan ringan.',
      'pending',
      null,
      now() - interval '2 hour'
    ),
    (
      '33333333-3333-4333-8333-333333333302',
      user_praktik_id,
      (select id from public.items where kode_barang = 'BOR-TGN-001'),
      1,
      current_date - 1,
      current_date + 2,
      null,
      'Membuat lubang dudukan baut untuk rangka praktik.',
      'approved',
      'Disetujui. Gunakan mata bor sesuai material.',
      now() - interval '1 day'
    ),
    (
      '33333333-3333-4333-8333-333333333303',
      user_las_id,
      (select id from public.items where kode_barang = 'MSN-LAS-001'),
      1,
      current_date - 2,
      current_date + 1,
      null,
      'Praktik pengelasan sambungan fillet.',
      'borrowed',
      'Sudah diambil di area las.',
      now() - interval '2 day'
    ),
    (
      '33333333-3333-4333-8333-333333333304',
      user_praktik_id,
      (select id from public.items where kode_barang = 'OBG-SET-001'),
      3,
      current_date - 8,
      current_date - 6,
      current_date - 6,
      'Praktik perawatan panel kelistrikan sederhana.',
      'returned',
      'Dikembalikan lengkap.',
      now() - interval '8 day'
    ),
    (
      '33333333-3333-4333-8333-333333333305',
      user_las_id,
      (select id from public.items where kode_barang = 'MSN-GRD-001'),
      1,
      current_date - 3,
      current_date - 1,
      null,
      'Pemotongan plat untuk tugas tambahan.',
      'rejected',
      'Ditolak karena jadwal penggunaan gerinda sudah penuh.',
      now() - interval '3 day'
    ),
    (
      '33333333-3333-4333-8333-333333333306',
      user_praktik_id,
      (select id from public.items where kode_barang = 'UKR-JSD-001'),
      1,
      current_date - 6,
      current_date - 2,
      null,
      'Pengukuran diameter luar dan dalam benda kerja.',
      'overdue',
      'Melewati tanggal kembali rencana.',
      now() - interval '6 day'
    ),
    (
      '33333333-3333-4333-8333-333333333307',
      user_las_id,
      (select id from public.items where kode_barang = 'TNG-KMB-001'),
      2,
      current_date,
      current_date + 4,
      null,
      'Persiapan rangka dan penjepitan material sebelum pengelasan.',
      'approved',
      'Ambil barang di rak tang A-04.',
      now() - interval '4 hour'
    )
  on conflict (id) do update
  set user_id = excluded.user_id,
      item_id = excluded.item_id,
      jumlah = excluded.jumlah,
      tanggal_pinjam = excluded.tanggal_pinjam,
      tanggal_kembali_rencana = excluded.tanggal_kembali_rencana,
      tanggal_kembali_aktual = excluded.tanggal_kembali_aktual,
      keperluan = excluded.keperluan,
      status = excluded.status,
      catatan_admin = excluded.catatan_admin,
      updated_at = now();
end $$;
