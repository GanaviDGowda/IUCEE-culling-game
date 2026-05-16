import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    // First try to get the role from user metadata
    let role = user.user_metadata?.role;

    // Fallback to db query
    if (!role) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single();
      if (profile) {
        role = profile.role;
      }
    }

    return { user, role };
  } catch {
    return null;
  }
}
