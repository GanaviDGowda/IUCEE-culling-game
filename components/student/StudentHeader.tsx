"use client";

import { usePathname } from "next/navigation";
import { RiNotification3Line, RiSearchLine } from "@remixicon/react";
import Image from "next/image";

const routeMap: Record<string, string> = {
  "/student/home": "Player Overview",
  "/student/points": "Points Ledger",
  "/student/events": "Event Registry",
  "/student/projects": "My Projects",
  "/student/more": "More Options",
};

export function StudentHeader() {
  const pathname = usePathname();
  let title = "Student Portal";
  
  for (const [route, name] of Object.entries(routeMap)) {
    if (pathname.startsWith(route)) {
      title = name;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 md:py-6 bg-black/80 md:bg-black/90 backdrop-blur-xl border-b border-zinc-900/50 md:border-b-zinc-800/50">
      
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
          <RiSearchLine className="w-4 h-4" />
          <span className="text-xs font-medium">Search...</span>
          <kbd className="ml-2 hidden lg:inline-block text-[10px] bg-zinc-850 px-1.5 rounded text-zinc-500 font-mono">⌘K</kbd>
        </button>
        <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-900">
          <RiSearchLine className="w-5 h-5" />
        </button>
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
          <RiNotification3Line className="w-5 h-5 text-zinc-300 md:w-5 md:h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black md:top-1.5 md:right-1.5"></span>
        </button>
      </div>
    </header>
  );
}
