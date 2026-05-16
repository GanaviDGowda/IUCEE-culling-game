"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bolt,
  Calendar,
  FolderKanban,
  MessageSquareShare,
  Trophy,
  LineChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { name: "Home", href: "/admin/home", icon: LayoutDashboard },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Points", href: "/admin/points", icon: Bolt },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Communication", href: "/admin/communication", icon: MessageSquareShare },
  { name: "Leaderboards", href: "/admin/leaderboards", icon: Trophy },
  { name: "Analytics", href: "/admin/analytics", icon: LineChart },
  { name: "System", href: "/admin/system", icon: Settings },
];

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  profile?: {
    name: string;
    email: string;
    role: string;
  };
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const name = profile?.name || "Administrator";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-black border-r border-zinc-800 z-50">
      <div className="flex items-center gap-3 p-6 border-b border-zinc-800">
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
          <Image src="/images/kogane.png" alt="Kogane" fill className="object-contain" />
        </div>
        <span className="font-heading font-semibold text-white tracking-tight">Kogane Admin</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                isActive 
                  ? "bg-red-500/10 text-red-500" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-colors", 
                  isActive ? "text-red-500" : "text-zinc-500 group-hover:text-zinc-300"
                )} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
          <Avatar className="w-8 h-8 border border-zinc-700">
            <AvatarFallback className="bg-zinc-800 text-xs font-bold text-zinc-400">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{name}</p>
            <p className="text-[10px] text-zinc-500 truncate capitalize">
              {profile?.role?.replace("_", " ") || "System Access"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
