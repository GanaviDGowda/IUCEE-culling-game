import { LandingPage } from "@/components/landing/LandingPage";
import { hasAuthSession } from "@/lib/auth-server";

export default async function RootPage() {
  const isAuthenticated = await hasAuthSession();
  return <LandingPage isAuthenticated={isAuthenticated} />;
}
