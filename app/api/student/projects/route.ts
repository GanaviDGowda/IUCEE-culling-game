import { NextResponse } from "next/server";

// In-memory project list for the process
let projects = [
  {
    id: "proj-1",
    name: "Kogane Web Dashboard",
    description: "Next-generation student metrics hub with responsive layout, glassmorphic design and real-time visualization widgets.",
    github_url: "https://github.com/arjun/kogane",
    external_url: "https://kogane.dev",
    status: "active",
    active: true,
    owner_id: "c0000000-0000-0000-0000-000000000001",
    quarter_id: "q-2",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      id: "c0000000-0000-0000-0000-000000000001",
      name: "Arjun Krishnamurthy",
      email: "4mc21cs010@mcehassan.ac.in"
    }
  },
  {
    id: "proj-2",
    name: "Cursed Speech Transcriber",
    description: "Real-time speech-to-text transcriber specializing in phoneme mapping and semantic matching under high signal-to-noise ratios.",
    github_url: "https://github.com/arjun/cursed-speech",
    external_url: null,
    status: "funded",
    active: true,
    owner_id: "c0000000-0000-0000-0000-000000000001",
    quarter_id: "q-2",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      id: "c0000000-0000-0000-0000-000000000001",
      name: "Arjun Krishnamurthy",
      email: "4mc21cs010@mcehassan.ac.in"
    }
  }
];

export async function GET() {
  return NextResponse.json({ data: projects });
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const githubUrl = typeof body.github_url === "string" ? body.github_url.trim() : null;
  const externalUrl = typeof body.external_url === "string" ? body.external_url.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const newProject = {
    id: `proj-${Math.random().toString(36).substring(2, 9)}`,
    name,
    description,
    github_url: githubUrl || null,
    external_url: externalUrl || null,
    status: "active",
    active: true,
    owner_id: "c0000000-0000-0000-0000-000000000001",
    quarter_id: "q-2",
    created_at: new Date().toISOString(),
    owner: {
      id: "c0000000-0000-0000-0000-000000000001",
      name: "Arjun Krishnamurthy",
      email: "4mc21cs010@mcehassan.ac.in"
    }
  };

  projects = [newProject, ...projects];

  return NextResponse.json({ data: newProject });
}
