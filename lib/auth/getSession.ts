import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!profile) {
      return null;
    }

    return { user, role: profile.role };
  } catch {
    return null;
  }
}
