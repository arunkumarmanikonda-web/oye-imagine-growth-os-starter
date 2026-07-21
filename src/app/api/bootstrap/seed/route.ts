import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST admin credentials plus tenant/brand/workspace payload to seed the first platform context.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    if (!url || !anonKey) {
      return NextResponse.json(
        { ok: false, error: "Supabase public env is missing." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const adminEmail =
      typeof body.adminEmail === "string" ? body.adminEmail.trim().toLowerCase() : "";
    const adminPassword =
      typeof body.adminPassword === "string" ? body.adminPassword : "";

    const tenantName =
      typeof body.tenantName === "string" && body.tenantName.trim().length > 0
        ? body.tenantName.trim()
        : "Oye Imagine Private Limited";

    const tenantSlug =
      typeof body.tenantSlug === "string" && body.tenantSlug.trim().length > 0
        ? body.tenantSlug.trim()
        : "oye-imagine";

    const brandName =
      typeof body.brandName === "string" && body.brandName.trim().length > 0
        ? body.brandName.trim()
        : "Oye !magine";

    const brandSlug =
      typeof body.brandSlug === "string" && body.brandSlug.trim().length > 0
        ? body.brandSlug.trim()
        : "oye-imagine-brand";

    const workspaceName =
      typeof body.workspaceName === "string" && body.workspaceName.trim().length > 0
        ? body.workspaceName.trim()
        : "Core Platform";

    const workspaceSlug =
      typeof body.workspaceSlug === "string" && body.workspaceSlug.trim().length > 0
        ? body.workspaceSlug.trim()
        : "core-platform";

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { ok: false, error: "adminEmail and adminPassword are required." },
        { status: 400 }
      );
    }

    const publicClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: signInData, error: signInError } = await publicClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInError || !signInData.user) {
      return NextResponse.json(
        { ok: false, error: signInError?.message ?? "Admin sign-in failed." },
        { status: 401 }
      );
    }

    const userRole =
      signInData.user.user_metadata?.role ??
      signInData.user.app_metadata?.role ??
      "";

    if (userRole !== "platform_admin") {
      return NextResponse.json(
        { ok: false, error: "Authenticated user is not a platform admin." },
        { status: 403 }
      );
    }

    const admin = createSupabaseAdminClient();

    const { data, error } = await admin.rpc("bootstrap_seed_platform", {
      p_admin_user_id: signInData.user.id,
      p_tenant_name: tenantName,
      p_tenant_slug: tenantSlug,
      p_brand_name: brandName,
      p_brand_slug: brandSlug,
      p_workspace_name: workspaceName,
      p_workspace_slug: workspaceSlug,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      seed: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown seed error",
      },
      { status: 500 }
    );
  }
}