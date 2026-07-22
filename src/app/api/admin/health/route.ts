import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function getAdminPassword() {
  return (process.env.ADMIN_PASSWORD ?? "").trim();
}

function isAuthorized(request: Request) {
  const expected = getAdminPassword();
  const provided = (request.headers.get("x-admin-password") ?? "").trim();
  return Boolean(expected) && provided === expected;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  const timestamp = new Date().toISOString();

  const envChecks = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
  };

  const missingEnv = Object.entries(envChecks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        timestamp,
        checks: {
          env: {
            ok: false,
            missing: missingEnv,
          },
          db: {
            ok: false,
            reason: "Skipped because required environment variables are missing.",
          },
        },
      },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { data, error } = await supabase
      .from("workspace_settings")
      .select("id, workspace_id, key, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          timestamp,
          checks: {
            env: { ok: true, missing: [] },
            db: {
              ok: false,
              reason: error.message,
            },
          },
        },
        { status: 500 }
      );
    }

    const latest = Array.isArray(data) && data.length > 0 ? data[0] : null;

    return NextResponse.json({
      ok: true,
      timestamp,
      checks: {
        env: {
          ok: true,
          missing: [],
        },
        db: {
          ok: true,
          latestWorkspaceSetting: latest,
        },
      },
      links: {
        adminHome: "/admin",
        summary: "/admin/summary",
        strategy: "/admin/strategy",
        execution: "/admin/execution",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown admin health error";

    return NextResponse.json(
      {
        ok: false,
        timestamp,
        checks: {
          env: { ok: true, missing: [] },
          db: {
            ok: false,
            reason: message,
          },
        },
      },
      { status: 500 }
    );
  }
}