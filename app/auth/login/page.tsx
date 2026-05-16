import type { Metadata } from "next";
import { AuthScreen } from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Sign in — Kogane Protocol",
  description: "Sign in to the Culling Game chapter dashboard.",
};

type PageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage(props: PageProps) {
  const sp = await props.searchParams;
  return <AuthScreen mode="signin" registered={sp.registered === "1"} />;
}
