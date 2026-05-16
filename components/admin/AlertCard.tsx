import { AlertCircle, AlertTriangle } from "lucide-react";

interface AlertCardProps {
  title: string;
  message: string;
  level?: "critical" | "warning";
  action?: React.ReactNode;
}

export function AlertCard({ title, message, level = "warning", action }: AlertCardProps) {
  const isCritical = level === "critical";
  const Icon = isCritical ? AlertCircle : AlertTriangle;
  
  return (
    <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
      isCritical 
        ? "bg-red-950/10 border-red-900/50" 
        : "bg-amber-950/10 border-amber-900/50"
    }`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
          isCritical ? "text-red-500" : "text-amber-500"
        }`} />
        <div className="flex-1">
          <h4 className={`text-sm font-semibold mb-1 ${
            isCritical ? "text-red-400" : "text-amber-400"
          }`}>
            {title}
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
      {action && (
        <div className="pl-8">
          {action}
        </div>
      )}
    </div>
  );
}
