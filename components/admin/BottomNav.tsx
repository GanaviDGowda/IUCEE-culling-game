"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bolt,
  Calendar,
  MenuSquare, // menu-2 equivalent in lucide-react might be Menu
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/home", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Points", href: "/points", icon: Bolt },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "More", href: "/more", icon: Menu }, // Or MenuSquare
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-black/90 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)] flex md:hidden items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
