"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[70] max-w-lg mx-auto bg-zinc-950/95 border-t border-zinc-800 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur-md",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-4" />
        
        {/* Header if title exists */}
        {title && (
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
            <h3 className="text-md font-semibold text-white tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="text-zinc-200">
          {children}
        </div>
      </div>
    </>
  );
}
