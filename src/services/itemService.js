import { supabase } from "../lib/supabaseClient.js";

function normalizeSearch(value = "") {
  return value.trim().replaceAll(",", " ");
}

function normalizeItemPayload(values) {
  return {
    nama_barang: values.nama_barang?.trim(),
    kategori: values.kategori?.trim(),
    kode_barang: values.kode_barang?.trim(),
    stok_total: Number(values.stok_total),
    stok_tersedia: Number(values.stok_tersedia),
    kondisi: values.kondisi?.trim(),
    status: values.status,
    lokasi_penyimpanan: values.lokasi_penyimpanan?.trim(),
    deskripsi: values.deskripsi?.trim() || null,
    gambar_url: values.gambar_url || null,
  };
}

async function ensureCategory(name) {
  if (!name) return;

  await supabase.from("categories").upsert(
    {
      nama_kategori: name,
    },
    {
      onConflict: "nama_kategori",
      ignoreDuplicates: true,
    }
  );
}

export const itemService = {
  async getItems({ limit, onlyBorrowable = false, search = "", status = "" } = {}) {
    const searchTerm = normalizeSearch(search);
    let query = supabase.from("items").select("*").order("created_at", {
      ascending: false,
    });

    if (searchTerm) {
      query = query.or(
        `nama_barang.ilike.%${searchTerm}%,kategori.ilike.%${searchTerm}%,kode_barang.ilike.%${searchTerm}%`
      );
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (onlyBorrowable) {
      query = query.eq("status", "tersedia").gt("stok_tersedia", 0);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getItemById(id) {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createItem(values) {
    const payload = normalizeItemPayload(values);
    await ensureCategory(payload.kategori);

    const { data, error } = await supabase
      .from("items")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(id, values) {
    const payload = normalizeItemPayload(values);
    await ensureCategory(payload.kategori);

    const { data, error } = await supabase
      .from("items")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(id) {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
  },

  async uploadItemImage(file) {
    const fileExt = file.name.split(".").pop();
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filePath = `items/${Date.now()}-${safeName}.${fileExt}`;

    const { error } = await supabase.storage
      .from("item-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("item-images").getPublicUrl(filePath);
    return data.publicUrl;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("nama_kategori", { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
