"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import Image from "next/image";

const routeMap: Record<string, string> = {
  "/admin/home": "Dashboard Overview",
  "/admin/members": "Member Directory",
  "/admin/points": "Points Ledger",
  "/admin/events": "Event Management",
  "/admin/projects": "Projects",
  "/admin/communication": "Communication",
  "/admin/leaderboards": "Leaderboards",
  "/admin/analytics": "Analytics",
  "/admin/system": "System Settings",
  "/admin/more": "More Options",
};

export function AdminHeader() {
  const pathname = usePathname();
  let title = "Admin Panel";
  for (const [route, name] of Object.entries(routeMap)) {
    // Exact or prefix match, handling dynamic routes like [id]
    if (pathname.startsWith(route)) {
      title = name;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 md:py-6 bg-black/80 md:bg-black/90 backdrop-blur-xl border-b border-white/10 md:border-b-zinc-800/50">
      
      {/* Mobile Title with Logo */}
      <div className="flex md:hidden items-center gap-3">
        <Image src="/images/kogane.png" alt="Kogane" width={28} height={28} className="object-contain" />
        <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
      </div>

      {/* Desktop Title */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
          <Search className="w-4 h-4" />
          <span className="text-xs font-medium">Search...</span>
          <kbd className="ml-2 hidden lg:inline-block text-[10px] bg-zinc-800 px-1.5 rounded text-zinc-500 font-mono">⌘K</kbd>
        </button>
        <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-900">
          <Search className="w-5 h-5" />
        </button>
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-zinc-300 md:w-5 md:h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black md:top-1.5 md:right-1.5"></span>
        </button>
      </div>
    </header>
  );
}
