import Link from "next/link";
import Image from "next/image";

import AtmosphereEngine, { KoganePanel } from "@/components/AtmosphereEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const FEATURES = [
  {
    title: "Cursed energy economy",
    body: "Earn redeemable points through attendance, presentations, projects, and events. Lifetime score never decreases.",
  },
  {
    title: "Tier progression",
    body: "Climb from Active to Contributor, Elite, Domain Master — or sacrifice 100 points to awaken Century status.",
  },
  {
    title: "Colony calendar",
    body: "Meetings, hackathons, NSS drives, and industry visits with deadlines, RSVP, and proof uploads.",
  },
  {
    title: "Danger zone protocol",
    body: "Quarterly minimums keep the colony alive. Fall below threshold and the system marks you critical.",
  },
  {
    title: "Leaderboard & domains",
    body: "Quarter rankings, streak flames, domain sub-boards, and podium styling for top performers.",
  },
  {
    title: "Role-bound access",
    body: "Students, Conveyors, Nodal Officers, and Admins each operate within their colony clearance level.",
  },
];

const TIERS = [
  { name: "Active", color: "text-[#9CA3AF]" },
  { name: "Contributor", color: "text-blue-400" },
  { name: "Elite", color: "text-purple-400" },
  { name: "Domain Master", color: "text-[#C9A84C]" },
  { name: "Century", color: "text-[#DC2626]" },
];

export type LandingPageProps = {
  isAuthenticated?: boolean;
};

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <AtmosphereEngine>
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-10 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/jjk-loading-logo.svg"
              alt=""
              width={40}
              height={40}
              className="opacity-90 brightness-0 invert"
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#6B7280]">
                IUCEE EWB Student Chapter
              </p>
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.1em] text-[#E8E4DC]">
                Culling Game
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAuthenticated ? (
              <Button
                asChild
                className="border-0 bg-[#8B0000] font-mono text-[10px] uppercase tracking-[0.14em] hover:bg-[#DC2626]"
              >
                <Link href="/home">Enter colony</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="border-[rgba(139,0,0,0.35)] bg-transparent font-mono text-[10px] uppercase tracking-[0.14em] text-[#E8E4DC] hover:bg-[rgba(139,0,0,0.12)]"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="border-0 bg-[#D90429] font-mono text-[10px] uppercase tracking-[0.14em] hover:bg-[#b80322]"
                >
                  <Link href="/auth/signup">Register player</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <section className="mt-16 flex flex-col gap-8 md:mt-24">
          <Badge
            variant="outline"
            className="w-fit border-[rgba(139,0,0,0.35)] bg-[rgba(139,0,0,0.08)] font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]"
          >
            Kogane Protocol v1.0
          </Badge>
          <h1 className="max-w-3xl font-mono text-3xl font-semibold uppercase leading-tight tracking-[0.06em] text-[#E8E4DC] md:text-5xl">
            A cursed colony management system for chapter engagement.
          </h1>
          <p className="max-w-2xl font-mono text-sm leading-relaxed text-[#6B7280] md:text-base">
            Not a SaaS dashboard. Not a fan site. The Culling Game tracks your
            cursed energy — points earned through meetings, projects, events,
            and accountability. Bind your vow. Enter the colony.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 border-0 bg-[#D90429] px-6 font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-[#b80322]"
            >
              <Link href={isAuthenticated ? "/home" : "/auth/signup"}>
                {isAuthenticated ? "Open dashboard" : "Begin registration"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 border-[rgba(0,229,255,0.25)] bg-transparent px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.06)]"
            >
              <Link href="/auth/signup">Read colony law after binding</Link>
            </Button>
          </div>
        </section>

        <KoganePanel className="mt-16 p-6 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
            Tier ladder
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {TIERS.map((tier) => (
              <span
                key={tier.name}
                className={`font-mono text-xs uppercase tracking-[0.12em] ${tier.color}`}
              >
                {tier.name}
              </span>
            ))}
          </div>
        </KoganePanel>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="border-[rgba(139,0,0,0.18)] bg-[rgba(10,10,10,0.5)] text-[#E8E4DC] shadow-none backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="font-mono text-xs uppercase tracking-[0.1em]">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-mono text-xs leading-relaxed text-[#6B7280]">
                  {feature.body}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        <Separator className="my-16 bg-[rgba(139,0,0,0.2)]" />

        <footer className="flex flex-col gap-2 pb-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[#4B5563]">
          <p>Culling Game — Chapter Engagement Platform</p>
          <p>June 2026 · Draft for review</p>
        </footer>
      </div>
    </AtmosphereEngine>
  );
}
