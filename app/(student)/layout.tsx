import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentBottomNav } from "@/components/student/StudentBottomNav";
import { StudentHeader } from "@/components/student/StudentHeader";
import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;
  const profile = {
    name: user?.user_metadata?.name || "Student Player",
    role: session.role || "student",
    email: user?.email || "",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-zinc-100">
      <StudentSidebar profile={profile} />
      <div className="flex-1 flex flex-col pb-14 md:pb-0 h-full overflow-hidden">
        <main className="flex-1 w-full md:max-w-5xl md:mx-auto flex flex-col h-full overflow-hidden">
          <StudentHeader />
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-none">
            {children}
          </div>
        </main>
      </div>
      <StudentBottomNav />
    </div>
  );
}
