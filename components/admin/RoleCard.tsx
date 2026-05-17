import { RiUserSettingsLine, RiShieldUserLine, RiArrowRightSLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";

interface RoleCardProps {
  name: string;
  description: string;
  count: number;
  permissions: string[];
  onManage?: () => void;
}

export function RoleCard({ name, description, count, permissions, onManage }: RoleCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/60 transition-all group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            <RiShieldUserLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{name}</h3>
            <p className="text-[10px] text-zinc-500">{description}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700 text-[10px]">
          {count} Users
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {permissions.map((perm) => (
          <span key={perm} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            {perm}
          </span>
        ))}
      </div>

      <button 
        onClick={onManage}
        className="mt-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-[11px] font-bold border border-white/5"
      >
        <RiUserSettingsLine className="w-3.5 h-3.5" />
        Manage Permissions
        <RiArrowRightSLine className="w-3.5 h-3.5 ml-auto" />
      </button>
    </div>
  );
}
