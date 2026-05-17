import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { supabase, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, adminId: profile.id };
}

export async function GET(request: Request) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    // 1. Fetch all projects with owner details
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*, owner:users(id, name, email, avatar_url, branch, year)")
      .order("created_at", { ascending: false });

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    // 2. Fetch all collaborators for all projects
    const { data: collaborators } = await supabase
      .from("project_collaborators")
      .select("project_id, user:users(id, name, avatar_url)");

    // 3. Fetch all project updates (weekly updates)
    const { data: updates } = await supabase
      .from("project_updates")
      .select("*, project:projects(id, name), user:users(id, name)")
      .order("submitted_at", { ascending: false });

    // 4. Map collaborators to each project
    const mappedProjects = (projects || []).map((project) => {
      const team = (collaborators || [])
        .filter((c) => c.project_id === project.id)
        .map((c) => c.user);
      return {
        ...project,
        team,
      };
    });

    // 5. Weekly updates classification
    const pendingUpdates = (updates || []).filter((u) => u.status === "pending");

    // Helper: Find projects that haven't updated recently
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const missingUpdatesList: any[] = [];
    const dormantList: any[] = [];

    mappedProjects.forEach((project) => {
      const projectUpdates = (updates || []).filter((u) => u.project_id === project.id);
      const latestUpdate = projectUpdates[0]; // Already ordered by DESC

      if (!latestUpdate) {
        // Never updated is both missing and dormant
        missingUpdatesList.push(project);
        dormantList.push(project);
      } else {
        const lastSubmittedDate = new Date(latestUpdate.submitted_at);
        if (lastSubmittedDate < sevenDaysAgo) {
          missingUpdatesList.push(project);
        }
        if (lastSubmittedDate < fourteenDaysAgo) {
          dormantList.push(project);
        }
      }
    });

    // 6. Funding Claims classification
    const claims = mappedProjects.filter((p) => p.funded && !p.funded_pts_claimed);
    const awarded = mappedProjects.filter((p) => p.funded && p.funded_pts_claimed);

    return NextResponse.json({
      projects: mappedProjects,
      weekly_updates: {
        pending: pendingUpdates,
        missing: missingUpdatesList,
        dormant: dormantList,
      },
      funding_claims: {
        claims,
        awarded,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
