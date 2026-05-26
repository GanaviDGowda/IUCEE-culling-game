"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiFlashlightLine,
  RiCalendarEventLine,
  RiFolderShield2Line,
  RiMenuLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/student/home", icon: RiDashboardLine },
  { name: "Points", href: "/student/points", icon: RiFlashlightLine },
  { name: "Events", href: "/student/events", icon: RiCalendarEventLine },
  { name: "Projects", href: "/student/projects", icon: RiFolderShield2Line },
  { name: "More", href: "/student/more", icon: RiMenuLine },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-black/90 backdrop-blur-md border-t border-zinc-800/80 pb-[env(safe-area-inset-bottom)] flex md:hidden items-center justify-around px-2 shadow-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
              isActive ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight">{item.name}</span>
            {isActive && (
              <span className="absolute top-0 w-8 h-[2px] bg-red-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
