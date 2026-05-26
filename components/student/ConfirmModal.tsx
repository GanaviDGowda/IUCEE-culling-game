"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "success";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
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

  if (!mounted || !isOpen) return null;

  const confirmButtonStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50 shadow-lg shadow-red-600/10",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/50 shadow-lg shadow-emerald-600/10",
    primary: "bg-zinc-100 hover:bg-zinc-200 text-zinc-950 focus:ring-white/20 shadow-lg",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden border border-zinc-800 bg-zinc-950/95 rounded-2xl p-6 shadow-2xl backdrop-blur-md transition-all">
        <div className="flex gap-4">
          {variant === "danger" && (
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-md font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 disabled:opacity-50 flex items-center justify-center min-w-[70px]",
              confirmButtonStyles[variant]
            )}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
