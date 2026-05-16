import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export function FAB({ icon = <Plus className="w-6 h-6" />, className, ...props }: FABProps) {
  return (
    <button
      className={cn(
        "fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform active:scale-95",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
