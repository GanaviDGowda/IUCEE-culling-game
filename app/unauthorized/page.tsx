import { SignOutButton } from "@/components/admin/SignOutButton";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Unauthorized</h1>
      <p className="text-zinc-400 mb-8 text-center max-w-md">
        You do not have permission to access this page. Only admin users are allowed.
      </p>
      <div className="w-full max-w-xs">
        <SignOutButton />
      </div>
    </div>
  );
}
