import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AuthHexGridBackground } from "@/components/auth/AuthHexGridBackground";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Approval pending - Kogane Protocol",
  description: "Your Culling Game chapter registration is waiting for admin approval.",
};

type PageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function PendingRegistrationPage(props: PageProps) {
  const sp = await props.searchParams;
  const freshRegistration = sp.registered === "1";
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const { data: registration } = user
    ? await supabase
        .from("registration_requests")
        .select("status, review_note")
        .eq("auth_uid", user.id)
        .maybeSingle()
    : { data: null };
    
  const rejected = registration?.status === "rejected";

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-6">
      <AuthHexGridBackground />
      <Card className="relative z-10 w-full max-w-sm border border-zinc-800 bg-black/80 text-center shadow-2xl backdrop-blur-md">
        <CardHeader className="items-center gap-3">
          <Image
            src="/images/kogane.png"
            alt="Kogane"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
          <CardTitle className="font-heading text-xl text-white">Approval Pending</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            {rejected
              ? "Your registration request was not approved."
              : freshRegistration
              ? "Your registration request is sealed and waiting in the admin queue."
              : "Your account exists, but chapter access has not been approved yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-zinc-400">
          {rejected
            ? registration?.review_note || "Contact the chapter administrator if you think this was a mistake."
            : "An administrator must verify your USN and approve the request before the dashboard opens."}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <SignOutButton />
          <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-white">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
