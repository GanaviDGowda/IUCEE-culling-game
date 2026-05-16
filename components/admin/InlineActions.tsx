interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

interface InlineActionsProps {
  actions: ActionItem[];
}

export function InlineActions({ actions }: InlineActionsProps) {
  return (
    <div className="flex items-center gap-2 pt-2 mt-2 border-t border-zinc-800/50">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            action.destructive 
              ? "text-red-400 hover:bg-red-950/30" 
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
