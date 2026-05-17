import { supabase } from "./supabase";

export type Branch = "CSE" | "ISE" | "ECE" | "EEE" | "MECH" | "CIVIL" | "AUTO" | "CHEM" | "BT";

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  usn: string;
  phone?: string;
  branch: Branch;
  year: string;
  referralCode?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

/** Register -> creates auth user + pending registration request via DB trigger. */
export async function signUp({
  name,
  email,
  password,
  usn,
  phone,
  branch,
  year,
  referralCode,
}: SignUpPayload) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: {
        name: name.trim(),
        role: "student",
        registration_flow: "student_signup",
        usn: usn.trim().toUpperCase(),
        phone: phone?.trim() || null,
        branch,
        year,
        referral_code: referralCode?.trim() || null,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Auth user not returned after sign up.");

  await supabase.auth.signOut();
  return authData;
}

/** Sign in with email + password. */
export async function signIn({ email, password }: SignInPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get the current session (null if not logged in). */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Fetch the full public.users profile for the logged-in user. */
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
