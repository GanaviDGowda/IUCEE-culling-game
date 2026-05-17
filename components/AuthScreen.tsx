"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { AuthHexGridBackground } from "@/components/auth/AuthHexGridBackground";
import { signIn, signUp, type Branch } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const BRANCHES: Branch[] = ["CSE", "ISE", "ECE", "EEE", "MECH", "CIVIL", "AUTO", "CHEM", "BT"];
const YEARS = ["1", "2", "3", "4"];

const tabLinkClass = (active: boolean) =>
  cn(
    "h-8 rounded-none border-0 text-xs font-semibold tracking-tight",
    active
      ? "bg-glow/12 text-glow hover:bg-glow/20"
      : "text-muted-foreground hover:text-foreground"
  );

export type AuthScreenProps = {
  mode: "signin" | "signup";
  registered?: boolean;
};

export function AuthScreen({ mode, registered }: AuthScreenProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usn, setUsn] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState<Branch>("CSE");
  const [year, setYear] = useState("1");
  const [referralCode, setReferralCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seal, setSeal] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [signupRitual, setSignupRitual] = useState(false);

  const registeredBanner =
    mode === "signin" &&
    registered &&
    "Registration received. You can sign in after an administrator approves your account.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setSeal(true);

    try {
      if (mode === "signup") {
        await signUp({
          name,
          email,
          password,
          usn,
          phone,
          branch,
          year,
          referralCode,
        });
        setSeal(false);
        setSignupRitual(true);
        setRitual(true);
        await new Promise((r) => setTimeout(r, 1200));
        router.push("/auth/pending?registered=1");
        router.refresh();
      } else {
        await signIn({ email, password });
        setSeal(false);
        setSignupRitual(false);
        setRitual(true);
        await new Promise((r) => setTimeout(r, 1200));
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setRitual(false);
      setSignupRitual(false);
      setError(err instanceof Error ? err.message : "System rejected the vow.");
    } finally {
      setBusy(false);
      setSeal(false);
    }
  }

  const formLocked = busy || ritual;

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-6">
      <AuthHexGridBackground />

      <Card
        className={cn(
          "auth-binding-card relative z-10 w-full max-w-sm gap-0 border bg-card/90 py-0 text-card-foreground shadow-lg backdrop-blur-md",
          seal && "auth-seal-active"
        )}
      >
        <CardHeader className="flex flex-col items-center gap-2.5 px-5 pt-5 pb-3 text-center">
          <div className="relative flex size-[72px] items-center justify-center">
            <div className="auth-kogane-halo absolute inset-0 rounded-full" aria-hidden />
            <Image
              src="/images/kogane.png"
              alt="Kogane"
              width={72}
              height={72}
              style={{ height: "auto" }}
              className="auth-kogane-glow relative object-contain"
              priority
            />
          </div>
          <div className="font-mono-stats flex items-center justify-center gap-1.5 text-xs font-medium tracking-tight text-glow/85">
            <span className="inline-block size-1 rounded-full bg-cta" aria-hidden />
            Binding vow - system entry
          </div>
          <CardTitle className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Kogane Protocol
          </CardTitle>
          <CardDescription className="text-xs tracking-tight text-muted-foreground">
            {mode === "signin"
              ? "Identify yourself, player."
              : "Register your chapter identity for approval."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 px-5 pb-4">
          <ButtonGroup className="grid w-full grid-cols-2 gap-0 overflow-hidden rounded-md border border-glow/20 p-0">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={tabLinkClass(mode === "signin")}
            >
              <Link href="/auth/login" prefetch>
                Sign in
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={tabLinkClass(mode === "signup")}
            >
              <Link href="/auth/signup" prefetch>
                Register
              </Link>
            </Button>
          </ButtonGroup>

          <Separator className="bg-glow/10" />

          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit}
            autoComplete="on"
            aria-busy={formLocked}
          >
            <FieldGroup className="gap-3">
              {mode === "signup" && (
                <Field className="gap-1">
                  <FieldLabel htmlFor="auth-name" className="text-xs text-muted-foreground">
                    Display name
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="auth-name"
                      name="name"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      autoFocus
                      placeholder="Legal name on file"
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                      className="h-9 text-sm"
                    />
                  </FieldContent>
                </Field>
              )}

              {mode === "signup" && (
                <Field className="gap-1">
                  <FieldLabel htmlFor="auth-usn" className="text-xs text-muted-foreground">
                    USN
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="auth-usn"
                      name="usn"
                      required
                      minLength={6}
                      maxLength={20}
                      autoComplete="off"
                      placeholder="4MC24CS101"
                      value={usn}
                      onChange={(ev) => setUsn(ev.target.value.toUpperCase())}
                      className="h-9 text-sm uppercase"
                    />
                  </FieldContent>
                </Field>
              )}

              <Field className="gap-1">
                <FieldLabel htmlFor="auth-email" className="text-xs text-muted-foreground">
                  Channel (email)
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="auth-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus={mode === "signin"}
                    placeholder="player@mcehassan.ac.in"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    className="h-9 text-sm"
                  />
                </FieldContent>
              </Field>

              <Field className="gap-1">
                <FieldLabel htmlFor="auth-password" className="text-xs text-muted-foreground">
                  Access key
                </FieldLabel>
                <FieldContent>
                  <InputGroup className="h-9 min-h-9">
                    <InputGroupInput
                      id="auth-password"
                      name="password"
                      type={showPw ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      placeholder="********"
                      value={password}
                      onChange={(ev) => setPassword(ev.target.value)}
                      className="text-sm"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:text-glow"
                        aria-label={showPw ? "Mask access key" : "Reveal access key"}
                        onClick={() => setShowPw((p) => !p)}
                      >
                        {showPw ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </FieldContent>
              </Field>

              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-2">
                  <Field className="gap-1">
                    <FieldLabel htmlFor="auth-branch" className="text-xs text-muted-foreground">
                      Branch
                    </FieldLabel>
                    <FieldContent>
                      <select
                        id="auth-branch"
                        name="branch"
                        required
                        value={branch}
                        onChange={(ev) => setBranch(ev.target.value as Branch)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        {BRANCHES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </FieldContent>
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="auth-year" className="text-xs text-muted-foreground">
                      Year
                    </FieldLabel>
                    <FieldContent>
                      <select
                        id="auth-year"
                        name="year"
                        required
                        value={year}
                        onChange={(ev) => setYear(ev.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        {YEARS.map((item) => (
                          <option key={item} value={item}>
                            Year {item}
                          </option>
                        ))}
                      </select>
                    </FieldContent>
                  </Field>
                </div>
              )}

              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-2">
                  <Field className="gap-1">
                    <FieldLabel htmlFor="auth-phone" className="text-xs text-muted-foreground">
                      Phone
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="auth-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        maxLength={15}
                        autoComplete="tel"
                        placeholder="Optional"
                        value={phone}
                        onChange={(ev) => setPhone(ev.target.value)}
                        className="h-9 text-sm"
                      />
                    </FieldContent>
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="auth-referral" className="text-xs text-muted-foreground">
                      Referral
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="auth-referral"
                        name="referral"
                        maxLength={20}
                        autoComplete="off"
                        placeholder="Optional"
                        value={referralCode}
                        onChange={(ev) => setReferralCode(ev.target.value.toUpperCase())}
                        className="h-9 text-sm uppercase"
                      />
                    </FieldContent>
                  </Field>
                </div>
              )}
            </FieldGroup>

            {registeredBanner && (
              <Alert className="border-success/45 bg-success-surface/80 px-3 py-2">
                <AlertTitle className="text-xs tracking-tight text-success-foreground">
                  Registration submitted
                </AlertTitle>
                <AlertDescription className="text-xs leading-snug text-success-muted">
                  {registeredBanner}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="px-3 py-2">
                <AlertTitle className="text-xs tracking-tight">
                  Vow rejected
                </AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={formLocked}
              className="h-9 w-full border-0 bg-cta text-sm font-semibold tracking-tight text-cta-foreground hover:bg-cta/90"
            >
              {busy
                ? "Sealing..."
                : mode === "signin"
                  ? "Submit vow - enter"
                  : "Submit vow - request access"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="border-t border-glow/10 px-5 py-2.5">
          <p className="w-full text-center text-xs text-muted-foreground">
            {mode === "signin" ? "No chapter file? " : "Already approved? "}
            <Link
              href={mode === "signin" ? "/auth/signup" : "/auth/login"}
              className="text-success-muted underline-offset-4 hover:text-success-foreground"
            >
              {mode === "signin" ? "Open registry" : "Return to gate"}
            </Link>
          </p>
        </CardFooter>
      </Card>

      {ritual && (
        <Card
          role="alertdialog"
          aria-modal
          aria-labelledby="auth-ritual-title"
          className="fixed inset-0 z-[200] flex max-h-none max-w-none flex-col items-center justify-center gap-4 rounded-none border-0 bg-background/95 p-6 text-center shadow-none ring-0 backdrop-blur-md"
        >
          <span id="auth-ritual-title" className="sr-only">
            Binding ritual in progress
          </span>
          {signupRitual && (
            <Alert className="max-w-sm border-success/45 bg-success-surface/95 px-3 py-2">
              <AlertTitle className="text-xs tracking-tight text-success-foreground">
                Registration submitted
              </AlertTitle>
              <AlertDescription className="text-xs tracking-tight text-success-muted">
                Seal acknowledged. Awaiting administrator approval.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col items-center gap-3">
            <div className="auth-ritual-ring relative flex size-28 items-center justify-center rounded-full border bg-card/50">
              <div
                className="auth-jjk-orbit-reverse pointer-events-none absolute inset-2 rounded-full border border-dashed border-glow/25"
                aria-hidden
              />
              <Image
                src="/images/jjk-loading-logo.svg"
                alt=""
                width={88}
                height={88}
                className="auth-jjk-loader object-contain brightness-0 invert"
                priority
              />
            </div>
            <CardTitle className="font-mono-stats text-xs tracking-tight text-glow">
              {signupRitual ? "Inscribing registry" : "Domain transit"}
            </CardTitle>
            <CardDescription className="max-w-xs text-xs tracking-tight text-muted-foreground">
              Cursed seal in motion - do not sever the channel.
            </CardDescription>
          </div>
        </Card>
      )}
    </div>
  );
}
