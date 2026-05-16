import { createClient } from "@/lib/supabase/client";

/** Browser Supabase client (cookie-backed via @supabase/ssr). */
export const supabase = createClient();
