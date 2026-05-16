/**
 * 1) POST seed-demo Edge Function (Auth + public.users sync to fixed UUIDs)
 * 2) Run supabase/seed.sql against local Postgres
 *
 * Requires .env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Requires: Docker (supabase start), functions served or deployed.
 */
const path = require("path");
const { execSync } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const fnUrl = `${url.replace(/\/$/, "")}/functions/v1/seed-demo`;

async function main() {
  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("seed-demo failed:", res.status, text);
    process.exit(1);
  }
  console.log(text);

  execSync("npx supabase db query --local -f supabase/seed.sql", {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
