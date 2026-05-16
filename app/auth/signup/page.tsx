import type { Metadata } from "next";
import { AuthScreen } from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Register — Kogane Protocol",
  description: "Create a Culling Game chapter account.",
};

export default function SignupPage() {
  return <AuthScreen mode="signup" />;
}
