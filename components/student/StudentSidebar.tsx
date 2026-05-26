"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  RiDashboardLine,
  RiFlashlightLine,
  RiCalendarEventLine,
  RiFolderShield2Line,
  RiMenuLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Home", href: "/student/home", icon: RiDashboardLine },
  { name: "Points", href: "/student/points", icon: RiFlashlightLine },
  { name: "Events", href: "/student/events", icon: RiCalendarEventLine },
  { name: "Projects", href: "/student/projects", icon: RiFolderShield2Line },
  { name: "More", href: "/student/more", icon: RiMenuLine },
];

interface StudentSidebarProps {
  profile?: {
    name: string;
    email: string;
    role: string;
  };
}

export function StudentSidebar({ profile }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const name = profile?.name || "Student Player";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-black border-r border-zinc-800 shrink-0">
      <div className="flex items-center gap-3 p-6 border-b border-zinc-800">
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
          <Image src="/images/kogane.png" alt="Kogane" fill className="object-contain" />
        </div>
        <span className="font-heading font-semibold text-white tracking-tight">Kogane Protocol</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
              />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      <div ref={menuRef} className="p-4 border-t border-zinc-800 relative">
        {menuOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-zinc-950 border border-zinc-800 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push(profile?.role === "admin" ? "/admin/more" : "/student/more");
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              View Settings & Profile
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleSignOut();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/10 transition-colors border-t border-zinc-900 mt-1 pt-2"
            >
              Sign out
            </button>
          </div>
        )}
        <div 
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/60 cursor-pointer transition-colors"
        >
          <Avatar className="w-8 h-8 border border-zinc-700">
            <AvatarFallback className="bg-zinc-855 text-xs font-bold text-zinc-400">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{name}</p>
            <p className="text-[10px] text-zinc-500 truncate capitalize">
              {profile?.role?.replace("_", " ") || "Student Access"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
