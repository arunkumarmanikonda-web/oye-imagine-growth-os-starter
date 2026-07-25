import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const workspaceDisplayName = getWorkspaceDisplayName();
  return NextResponse.json({
    ok: true,
    
    workspaceDisplayName,
    ready: Boolean(process.env.BOOTSTRAP_SECRET),
    note: "POST with x-bootstrap-secret header to create first admin user.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.BOOTSTRAP_SECRET ?? "";
    const providedSecret = request.headers.get("x-bootstrap-secret") ?? "";

    if (!configuredSecret) {
      return NextResponse.json(
        { ok: false, error: "BOOTSTRAP_SECRET is not configured." },
        { status: 500 }
      );
    }

    if (providedSecret !== configuredSecret) {
      return NextResponse.json(
        { ok: false, error: "Invalid bootstrap secret." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const fullName =
      typeof body.fullName === "string" && body.fullName.trim().length > 0
        ? body.fullName.trim()
        : "Platform Admin";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "email and password are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "platform_admin",
      },
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user?.id ?? null,
        email: data.user?.email ?? email,
        fullName,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown bootstrap error",
      },
      { status: 500 }
    );
  }
}