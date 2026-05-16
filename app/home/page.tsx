import { SignOutButton } from "@/components/admin/SignOutButton";

export default function StudentHomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-md w-full space-y-8 text-center bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-md">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Kogane Platform</h1>
          <p className="text-zinc-400">
            The student portal is currently under construction. Please check back later.
          </p>
        </div>
        
        <div className="pt-4 border-t border-zinc-800/50">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
