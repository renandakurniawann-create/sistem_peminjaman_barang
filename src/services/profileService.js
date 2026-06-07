import { supabase } from "../lib/supabaseClient.js";

export const profileService = {
  async getProfileById(id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(id, values) {
    const payload = {
      full_name: values.full_name,
      email: values.email,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
