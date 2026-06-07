-- Sistem Peminjaman Barang Bengkel
-- Jalankan file ini di Supabase SQL Editor setelah project Supabase dibuat.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'User',
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  nama_kategori text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  nama_barang text not null,
  kategori text not null,
  kode_barang text not null unique,
  stok_total integer not null default 0 check (stok_total >= 0),
  stok_tersedia integer not null default 0 check (stok_tersedia >= 0),
  kondisi text not null default 'Baik',
  status text not null default 'tersedia' check (status in ('tersedia', 'dipinjam', 'rusak', 'maintenance')),
  lokasi_penyimpanan text not null,
  deskripsi text,
  gambar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_stok_tersedia_valid check (stok_tersedia <= stok_total)
);

create table if not exists public.borrowings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  jumlah integer not null check (jumlah > 0),
  tanggal_pinjam date not null,
  tanggal_kembali_rencana date not null,
  tanggal_kembali_aktual date,
  keperluan text not null,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue')
  ),
  catatan_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint borrowings_date_valid check (tanggal_kembali_rencana >= tanggal_pinjam)
);

create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_kategori on public.items(kategori);
create index if not exists idx_items_nama_barang on public.items(nama_barang);
create index if not exists idx_borrowings_status on public.borrowings(status);
create index if not exists idx_borrowings_user_id on public.borrowings(user_id);
create index if not exists idx_borrowings_item_id on public.borrowings(item_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

drop trigger if exists borrowings_set_updated_at on public.borrowings;
create trigger borrowings_set_updated_at
before update on public.borrowings
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'User'),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_non_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role
    and current_user not in ('postgres', 'supabase_admin')
    and not public.is_admin()
  then
    raise exception 'Hanya admin yang boleh mengubah role user.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_non_admin_role_change on public.profiles;
create trigger profiles_prevent_non_admin_role_change
before update on public.profiles
for each row execute function public.prevent_non_admin_role_change();

create or replace function public.validate_borrowing_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_item public.items%rowtype;
begin
  if new.jumlah <= 0 then
    raise exception 'Jumlah pinjam harus lebih dari 0.';
  end if;

  if new.tanggal_kembali_rencana < new.tanggal_pinjam then
    raise exception 'Tanggal kembali rencana tidak boleh sebelum tanggal pinjam.';
  end if;

  if new.status = 'pending' then
    select *
    into selected_item
    from public.items
    where id = new.item_id
    for update;

    if not found then
      raise exception 'Barang tidak ditemukan.';
    end if;

    if selected_item.status <> 'tersedia' then
      raise exception 'Barang sedang tidak tersedia untuk dipinjam.';
    end if;

    if selected_item.stok_tersedia < new.jumlah then
      raise exception 'Jumlah pinjam melebihi stok tersedia.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists borrowings_validate_request on public.borrowings;
create trigger borrowings_validate_request
before insert on public.borrowings
for each row execute function public.validate_borrowing_request();

create or replace function public.approve_borrowing(
  borrowing_id uuid,
  admin_note text default null
)
returns public.borrowings
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_borrowing public.borrowings%rowtype;
  selected_item public.items%rowtype;
  new_available integer;
  updated_borrowing public.borrowings%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak. Hanya admin yang boleh approve peminjaman.';
  end if;

  select *
  into selected_borrowing
  from public.borrowings
  where id = borrowing_id
  for update;

  if not found then
    raise exception 'Data peminjaman tidak ditemukan.';
  end if;

  if selected_borrowing.status <> 'pending' then
    raise exception 'Hanya pengajuan pending yang bisa disetujui.';
  end if;

  select *
  into selected_item
  from public.items
  where id = selected_borrowing.item_id
  for update;

  if not found then
    raise exception 'Barang tidak ditemukan.';
  end if;

  if selected_item.status in ('rusak', 'maintenance') then
    raise exception 'Barang rusak atau maintenance tidak bisa dipinjam.';
  end if;

  if selected_item.stok_tersedia < selected_borrowing.jumlah then
    raise exception 'Stok tersedia tidak mencukupi.';
  end if;

  new_available := selected_item.stok_tersedia - selected_borrowing.jumlah;

  update public.items
  set stok_tersedia = new_available,
      status = case when new_available = 0 then 'dipinjam' else 'tersedia' end
  where id = selected_item.id;

  update public.borrowings
  set status = 'approved',
      catatan_admin = nullif(admin_note, '')
  where id = selected_borrowing.id
  returning * into updated_borrowing;

  return updated_borrowing;
end;
$$;

create or replace function public.reject_borrowing(
  borrowing_id uuid,
  admin_note text default null
)
returns public.borrowings
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_borrowing public.borrowings%rowtype;
  updated_borrowing public.borrowings%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak. Hanya admin yang boleh reject peminjaman.';
  end if;

  select *
  into selected_borrowing
  from public.borrowings
  where id = borrowing_id
  for update;

  if not found then
    raise exception 'Data peminjaman tidak ditemukan.';
  end if;

  if selected_borrowing.status <> 'pending' then
    raise exception 'Hanya pengajuan pending yang bisa ditolak.';
  end if;

  update public.borrowings
  set status = 'rejected',
      catatan_admin = coalesce(nullif(admin_note, ''), 'Ditolak oleh admin')
  where id = selected_borrowing.id
  returning * into updated_borrowing;

  return updated_borrowing;
end;
$$;

create or replace function public.mark_borrowing_borrowed(borrowing_id uuid)
returns public.borrowings
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_borrowing public.borrowings%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak. Hanya admin yang boleh mengubah status dipinjam.';
  end if;

  update public.borrowings
  set status = 'borrowed'
  where id = borrowing_id
    and status = 'approved'
  returning * into updated_borrowing;

  if not found then
    raise exception 'Hanya peminjaman approved yang bisa ditandai dipinjam.';
  end if;

  return updated_borrowing;
end;
$$;

create or replace function public.return_borrowing(borrowing_id uuid)
returns public.borrowings
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_borrowing public.borrowings%rowtype;
  selected_item public.items%rowtype;
  new_available integer;
  updated_borrowing public.borrowings%rowtype;
begin
  select *
  into selected_borrowing
  from public.borrowings
  where id = borrowing_id
  for update;

  if not found then
    raise exception 'Data peminjaman tidak ditemukan.';
  end if;

  if not public.is_admin() and selected_borrowing.user_id <> auth.uid() then
    raise exception 'Akses ditolak untuk mengembalikan peminjaman ini.';
  end if;

  if selected_borrowing.status not in ('approved', 'borrowed', 'overdue') then
    raise exception 'Peminjaman ini tidak bisa dikembalikan.';
  end if;

  select *
  into selected_item
  from public.items
  where id = selected_borrowing.item_id
  for update;

  if not found then
    raise exception 'Barang tidak ditemukan.';
  end if;

  new_available := least(
    selected_item.stok_total,
    selected_item.stok_tersedia + selected_borrowing.jumlah
  );

  update public.items
  set stok_tersedia = new_available,
      status = case
        when selected_item.status in ('rusak', 'maintenance') then selected_item.status
        when new_available = 0 then 'dipinjam'
        else 'tersedia'
      end
  where id = selected_item.id;

  update public.borrowings
  set status = 'returned',
      tanggal_kembali_aktual = current_date
  where id = selected_borrowing.id
  returning * into updated_borrowing;

  return updated_borrowing;
end;
$$;

create or replace function public.mark_overdue_borrowings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer;
begin
  update public.borrowings
  set status = 'overdue'
  where status in ('approved', 'borrowed')
    and tanggal_kembali_rencana < current_date;

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.borrowings enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles
for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin
on public.profiles
for delete
using (public.is_admin());

drop policy if exists categories_select_authenticated on public.categories;
create policy categories_select_authenticated
on public.categories
for select
to authenticated
using (true);

drop policy if exists categories_insert_admin on public.categories;
create policy categories_insert_admin
on public.categories
for insert
to authenticated
with check (public.is_admin());

drop policy if exists categories_update_admin on public.categories;
create policy categories_update_admin
on public.categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists categories_delete_admin on public.categories;
create policy categories_delete_admin
on public.categories
for delete
to authenticated
using (public.is_admin());

drop policy if exists items_select_authenticated on public.items;
create policy items_select_authenticated
on public.items
for select
to authenticated
using (true);

drop policy if exists items_insert_admin on public.items;
create policy items_insert_admin
on public.items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists items_update_admin on public.items;
create policy items_update_admin
on public.items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists items_delete_admin on public.items;
create policy items_delete_admin
on public.items
for delete
to authenticated
using (public.is_admin());

drop policy if exists borrowings_select_own_or_admin on public.borrowings;
create policy borrowings_select_own_or_admin
on public.borrowings
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists borrowings_insert_own_pending on public.borrowings;
create policy borrowings_insert_own_pending
on public.borrowings
for insert
to authenticated
with check (user_id = auth.uid() and status = 'pending');

drop policy if exists borrowings_update_admin on public.borrowings;
create policy borrowings_update_admin
on public.borrowings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists borrowings_delete_admin on public.borrowings;
create policy borrowings_delete_admin
on public.borrowings
for delete
to authenticated
using (public.is_admin());

insert into public.categories (nama_kategori)
values
  ('Kunci'),
  ('Obeng'),
  ('Bor'),
  ('Tang'),
  ('Mesin'),
  ('Alat Ukur'),
  ('Perlengkapan Praktik')
on conflict (nama_kategori) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images',
  'item-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists item_images_public_read on storage.objects;
create policy item_images_public_read
on storage.objects
for select
using (bucket_id = 'item-images');

drop policy if exists item_images_admin_insert on storage.objects;
create policy item_images_admin_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'item-images' and public.is_admin());

drop policy if exists item_images_admin_update on storage.objects;
create policy item_images_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'item-images' and public.is_admin())
with check (bucket_id = 'item-images' and public.is_admin());

drop policy if exists item_images_admin_delete on storage.objects;
create policy item_images_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'item-images' and public.is_admin());

grant execute on function public.approve_borrowing(uuid, text) to authenticated;
grant execute on function public.reject_borrowing(uuid, text) to authenticated;
grant execute on function public.mark_borrowing_borrowed(uuid) to authenticated;
grant execute on function public.return_borrowing(uuid) to authenticated;
grant execute on function public.mark_overdue_borrowings() to authenticated;
