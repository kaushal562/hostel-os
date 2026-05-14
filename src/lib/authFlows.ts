import { supabase } from "@/lib/supabase";

export async function signInWithEmailPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });
}

export async function signUpWithEmailPassword(email: string, password: string) {
  return await supabase.auth.signUp({
    email: email.trim(),
    password: password.trim(),
  });
}

