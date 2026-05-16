import { supabase } from "./supabase";

export type UserRole = "student" | "conveyor" | "nodal_officer" | "admin";

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface SignInPayload {
  email: string;
  password: string;
}

/** Register → creates auth user + public.users row (via DB trigger) */
export async function signUp({ name, email, password, role }: SignUpPayload) {
  // 1. Create the Supabase Auth account
  // The DB trigger `on_auth_user_created` will automatically insert into public.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role }, // stored in auth.users.raw_user_meta_data
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Auth user not returned after sign up.");

  return authData;
}

/** Sign in with email + password */
export async function signIn({ email, password }: SignInPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get the current session (null if not logged in) */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Fetch the full public.users profile for the logged-in user */
export async function getMyProfile() {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", uid)
    .single();

  if (error) throw error;
  return data;
}
