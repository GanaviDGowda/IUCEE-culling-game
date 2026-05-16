import Link from "next/link";
import { FolderKanban, MessageSquareShare, Trophy, LineChart, Settings, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth/getSession";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/admin/SignOutButton";

const moreMenuItems = [
  { 
    name: "Projects", 
    href: "/admin/projects", 
    icon: FolderKanban, 
    description: "Active projects and funding claims" 
  },
  { 
    name: "Communication", 
    href: "/admin/communication", 
    icon: MessageSquareShare, 
    description: "Notifications and alerts" 
  },
  { 
    name: "Leaderboards", 
    href: "/admin/leaderboards", 
    icon: Trophy, 
    description: "Domain rankings and tier distribution" 
  },
  { 
    name: "Analytics", 
    href: "/admin/analytics", 
    icon: LineChart, 
    description: "Engagement and performance metrics" 
  },
  { 
    name: "System", 
    href: "/admin/system", 
    icon: Settings, 
    description: "Colony and danger zone configurations" 
  },
];

export default async function AdminMorePage() {
  const session = await getSession();
  const user = session?.user;
  const name = user?.user_metadata?.name || "Administrator";
  const email = user?.email || "admin@kogane.com";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Profile Section */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
        <Avatar className="w-14 h-14 border border-zinc-800">
          <AvatarFallback className="bg-zinc-800 text-zinc-300 font-semibold text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{name}</h2>
          <p className="text-xs text-zinc-400 truncate">{email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {moreMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-xs text-zinc-400 truncate">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0" />
            </Link>
          );
        })}

        {/* Sign Out Action */}
        <SignOutButton />
      </div>
    </div>
  );
}
