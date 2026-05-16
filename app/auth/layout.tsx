import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account — Kogane Protocol",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">{children}</div>
  );
}
