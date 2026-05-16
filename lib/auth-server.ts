import { createClient } from "@/lib/supabase/server";

export type ServerProfile = {
  id: string;
  role: string;
  name: string;
  email: string;
};

/** Logged-in public.users row for the current session. */
export async function getServerProfile(): Promise<ServerProfile | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("id, role, name, email")
      .eq("auth_id", user.id)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Server-side session check (reads Supabase auth cookies). */
export async function hasAuthSession(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return false;
    return !!user;
  } catch {
    return false;
  }
}
