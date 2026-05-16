"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Refresh server state first to clear session cookies from Server Components
    router.refresh();
    router.push("/auth/login");
  };

  return (
    <button 
      onClick={handleSignOut}
      disabled={loading}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 transition-colors active:scale-[0.98] mt-4 text-left"
    >
      <div className="w-10 h-10 rounded-full bg-red-950/50 flex items-center justify-center shrink-0">
        <LogOut className={`w-5 h-5 text-red-400 ${loading ? "animate-pulse" : ""}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-red-400">
          {loading ? "Signing out..." : "Sign out"}
        </h3>
        <p className="text-xs text-red-400/70 truncate">End your session</p>
      </div>
    </button>
  );
}
