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
    <div className="flex min-h-screen bg-black text-zinc-100">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col md:pl-64 pb-14 md:pb-0">
        <main className="flex-1 w-full max-w-md md:max-w-5xl mx-auto flex flex-col">
          <AdminHeader />
          <div className="flex-1">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
