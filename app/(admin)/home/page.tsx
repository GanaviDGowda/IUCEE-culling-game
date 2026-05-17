import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { RiDashboardLine, RiCpuLine, RiGroupLine, RiFolderShield2Line, RiCalendarEventLine, RiAlertLine } from "@remixicon/react";

export default async function RoleAwareHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .maybeSingle()
    : { data: null };
  const role = profile?.role;

  if (role === "admin") {
    // Perform exact head-counts on Postgres tables to derive 100% live database metrics
    const [
      { count: playerTotal },
      { count: dangerTotal },
      { count: projectTotal },
      { count: meetingTotal },
      { count: pendingRegistrations }
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "danger_zone"),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("meetings").select("*", { count: "exact", head: true }),
      supabase.from("registration_requests").select("*", { count: "exact", head: true }).eq("status", "pending")
    ]);

    return (
      <div className="p-4 md:p-6 space-y-6">
        {/* Dynamic Live Metric Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Players</span>
              <RiGroupLine className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-black text-white">{playerTotal ?? 0}</p>
            <p className="text-[9px] text-zinc-500 font-bold">Registered profiles</p>
          </div>

          <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Danger Zone</span>
              <RiAlertLine className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-white">{dangerTotal ?? 0}</p>
            <p className="text-[9px] text-zinc-550 font-bold">Require intervention</p>
          </div>

          <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Claimed Projects</span>
              <RiFolderShield2Line className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-white">{projectTotal ?? 0}</p>
            <p className="text-[9px] text-zinc-500">Registered portfolio items</p>
          </div>

          <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Meetings</span>
              <RiCalendarEventLine className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-white">{meetingTotal ?? 0}</p>
            <p className="text-[9px] text-zinc-500">Total sessions tracked</p>
          </div>
        </div>

        {(pendingRegistrations ?? 0) > 0 && (
          <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-2xl space-y-2">
            <h3 className="text-xs font-black uppercase text-red-300 tracking-wider">
              Pending Registrations
            </h3>
            <p className="text-zinc-300 text-sm">
              {pendingRegistrations} student request{pendingRegistrations === 1 ? "" : "s"} waiting for approval in Members.
            </p>
          </div>
        )}

        <div className="bg-zinc-900/25 border border-zinc-850 p-6 rounded-2xl space-y-2.5">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
            <RiDashboardLine className="w-4 h-4 text-red-500" />
            System Status
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Welcome to the Kogane administration dashboard. The system has active real-time queries enabled. Navigate using the sidebar/bottom-bar to manage directories, allocate points, or audit colony safety parameters. All system counts are fetched dynamically from active databases.
          </p>
        </div>
      </div>
    );
  }

  // Render high-fidelity student portal placeholder
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-md w-full space-y-8 text-center bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-md">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Kogane Platform</h1>
          <p className="text-zinc-400">
            The student portal is currently under construction. Please check back later.
          </p>
        </div>
        
        <div className="pt-4 border-t border-zinc-800/50">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
