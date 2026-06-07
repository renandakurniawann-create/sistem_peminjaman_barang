import { supabase } from "../lib/supabaseClient.js";
import { validateBorrowingForm } from "../utils/validators.js";
import { itemService } from "./itemService.js";

const borrowingSelect = `
  *,
  item:items (
    id,
    nama_barang,
    kategori,
    kode_barang,
    stok_total,
    stok_tersedia,
    kondisi,
    status,
    lokasi_penyimpanan,
    gambar_url
  ),
  borrower:profiles (
    id,
    full_name,
    email,
    role
  )
`;

async function getCount(query) {
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

function assertNoValidationErrors(errors) {
  const firstError = Object.values(errors)[0];
  if (firstError) {
    throw new Error(firstError);
  }
}

export const borrowingService = {
  async getBorrowings({ limit, status = "", userId = "" } = {}) {
    let query = supabase
      .from("borrowings")
      .select(borrowingSelect)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getBorrowingById(id) {
    const { data, error } = await supabase
      .from("borrowings")
      .select(borrowingSelect)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createBorrowing(values) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("Sesi tidak ditemukan. Silakan login ulang.");

    const item = await itemService.getItemById(values.item_id);
    assertNoValidationErrors(validateBorrowingForm(values, item));

    const payload = {
      user_id: user.id,
      item_id: values.item_id,
      jumlah: Number(values.jumlah),
      tanggal_pinjam: values.tanggal_pinjam,
      tanggal_kembali_rencana: values.tanggal_kembali_rencana,
      keperluan: values.keperluan.trim(),
      status: "pending",
    };

    const { data, error } = await supabase
      .from("borrowings")
      .insert(payload)
      .select(borrowingSelect)
      .single();

    if (error) throw error;
    return data;
  },

  async approveBorrowing(id, note = "") {
    const { data, error } = await supabase.rpc("approve_borrowing", {
      admin_note: note || null,
      borrowing_id: id,
    });

    if (error) throw error;
    return data;
  },

  async rejectBorrowing(id, note = "") {
    const { data, error } = await supabase.rpc("reject_borrowing", {
      admin_note: note || null,
      borrowing_id: id,
    });

    if (error) throw error;
    return data;
  },

  async markBorrowed(id) {
    const { data, error } = await supabase.rpc("mark_borrowing_borrowed", {
      borrowing_id: id,
    });

    if (error) throw error;
    return data;
  },

  async returnBorrowing(id) {
    const { data, error } = await supabase.rpc("return_borrowing", {
      borrowing_id: id,
    });

    if (error) throw error;
    return data;
  },

  async markOverdueBorrowings() {
    const { data, error } = await supabase.rpc("mark_overdue_borrowings");
    if (error) throw error;
    return data;
  },

  async getAdminStats() {
    const [
      totalItems,
      availableItems,
      activeBorrowings,
      pendingBorrowings,
      completedBorrowings,
    ] = await Promise.all([
      getCount(supabase.from("items").select("id", { count: "exact", head: true })),
      getCount(
        supabase
          .from("items")
          .select("id", { count: "exact", head: true })
          .eq("status", "tersedia")
      ),
      getCount(
        supabase
          .from("borrowings")
          .select("id", { count: "exact", head: true })
          .in("status", ["approved", "borrowed", "overdue"])
      ),
      getCount(
        supabase
          .from("borrowings")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("borrowings")
          .select("id", { count: "exact", head: true })
          .eq("status", "returned")
      ),
    ]);

    return {
      activeBorrowings,
      availableItems,
      completedBorrowings,
      pendingBorrowings,
      totalItems,
    };
  },

  async getUserStats(userId) {
    const [pending, active, returned, rejected] = await Promise.all([
      getCount(
        supabase
          .from("borrowings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("borrowings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("status", ["approved", "borrowed", "overdue"])
      ),
      getCount(
        supabase
          .from("borrowings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "returned")
      ),
      getCount(
        supabase
          .from("borrowings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "rejected")
      ),
    ]);

    return {
      active,
      pending,
      rejected,
      returned,
    };
  },
};
