import { supabase } from "./supabase";

export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export const waitForSupabaseSession = async () => {
  // Ensures auth has had time to restore session from storage
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
};


// SECURITY: Admin authorization must NOT come from localStorage.
// Use Supabase-based checks in src/lib/adminAuth.ts instead.


export const logout = async () => {
  // Clear admin session if exists
  localStorage.removeItem("adminAuthenticated");

  // Sign out from Supabase
  await supabase.auth.signOut();
};
