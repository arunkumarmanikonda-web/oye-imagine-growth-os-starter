import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function recordAudit(admin: ReturnType<typeof createSupabaseAdminClient>, payload: {
  actor_user_id: string;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id?: string | null;
  tenant_id?: string | null;
  brand_id?: string | null;
  workspace_id?: string | null;
  payload?: Record<string, unknown>;
}) {
  await admin.from("admin_audit_events").insert({
    actor_user_id: payload.actor_user_id,
    actor_email: payload.actor_email,
    action: payload.action,
    target_type: payload.target_type,
    target_id: payload.target_id ?? null,
    tenant_id: payload.tenant_id ?? null,
    brand_id: payload.brand_id ?? null,
    workspace_id: payload.workspace_id ?? null,
    payload: payload.payload ?? {},
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST authenticated platform admin credentials plus Neejee tenant seed payload.",
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
        : "Neejee";

    const tenantSlug =
      typeof body.tenantSlug === "string" && body.tenantSlug.trim().length > 0
        ? body.tenantSlug.trim()
        : "neejee";

    const brandName =
      typeof body.brandName === "string" && body.brandName.trim().length > 0
        ? body.brandName.trim()
        : "Neejee";

    const brandSlug =
      typeof body.brandSlug === "string" && body.brandSlug.trim().length > 0
        ? body.brandSlug.trim()
        : "neejee-brand";

    const workspaceName =
      typeof body.workspaceName === "string" && body.workspaceName.trim().length > 0
        ? body.workspaceName.trim()
        : "Neejee Pilot";

    const workspaceSlug =
      typeof body.workspaceSlug === "string" && body.workspaceSlug.trim().length > 0
        ? body.workspaceSlug.trim()
        : "neejee-pilot";

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

    const seed = data as {
      tenant_id?: string;
      brand_id?: string;
      workspace_id?: string;
    };

    await recordAudit(admin, {
      actor_user_id: signInData.user.id,
      actor_email: signInData.user.email ?? null,
      action: "neejee_seed_created",
      target_type: "workspace_seed",
      target_id: seed.workspace_id ?? null,
      tenant_id: seed.tenant_id ?? null,
      brand_id: seed.brand_id ?? null,
      workspace_id: seed.workspace_id ?? null,
      payload: {
        tenantName,
        tenantSlug,
        brandName,
        brandSlug,
        workspaceName,
        workspaceSlug,
      },
    });

    return NextResponse.json({
      ok: true,
      seed: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown Neejee seed error",
      },
      { status: 500 }
    );
  }
}