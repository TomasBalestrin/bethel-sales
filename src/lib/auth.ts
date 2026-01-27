import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "closer";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
}

export interface UserWithRole extends UserProfile {
  role: AppRole | null;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentSession(): Promise<{ session: Session | null; user: User | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  return { session, user: session?.user ?? null };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error) {
    // No role assigned
    return null;
  }

  return data?.role as AppRole;
}

export async function getUserWithRole(userId: string): Promise<UserWithRole | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const role = await getUserRole(userId);
  
  return {
    ...profile,
    role,
  };
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
}
