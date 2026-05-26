import { BottomNav } from "@/components/admin/BottomNav";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSession } from "@/lib/auth/getSession";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session?.user;
  const profile = {
    name: user?.user_metadata?.name || "Administrator",
    role: session?.role || "admin",
    email: user?.email || "",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-zinc-100">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col pb-14 md:pb-0 h-full overflow-hidden">
        <main className="flex-1 w-full md:max-w-5xl md:mx-auto flex flex-col h-full overflow-hidden">
          <AdminHeader />
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-none">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
