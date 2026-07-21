import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAdminContext } from "@/lib/admin/active-context";
import { logAdminAuditEvent } from "@/lib/admin/audit";

function createServiceRoleClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

type WorkspaceNoteBody = {
  id?: string;
  title?: string;
  body?: string;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const active = await requireActiveAdminContext();
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("workspace_notes")
      .select("id, tenant_id, brand_id, workspace_id, title, body, created_by_user_id, created_by_email, updated_by_user_id, updated_by_email, created_at, updated_at")
      .eq("tenant_id", active.tenantId)
      .eq("brand_id", active.brandId)
      .eq("workspace_id", active.workspaceId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      active,
      items: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as WorkspaceNoteBody;
    const title = body.title?.trim() ?? "";
    const noteBody = body.body?.trim() ?? "";

    if (!title) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }

    const active = await requireActiveAdminContext();
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("workspace_notes")
      .insert({
        tenant_id: active.tenantId,
        brand_id: active.brandId,
        workspace_id: active.workspaceId,
        title,
        body: noteBody,
        created_by_user_id: user.id,
        created_by_email: user.email ?? null,
        updated_by_user_id: user.id,
        updated_by_email: user.email ?? null,
      })
      .select("id, tenant_id, brand_id, workspace_id, title, body, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    try {
      await logAdminAuditEvent({
        event: "admin_workspace_note_created",
        actorUserId: user.id,
        actorEmail: user.email ?? null,
        tenantId: active.tenantId,
        brandId: active.brandId,
        workspaceId: active.workspaceId,
        payload: {
          noteId: data.id,
          title: data.title,
        },
      });
    } catch (auditError) {
      console.error("Failed to write workspace note create audit event", auditError);
    }

    return NextResponse.json({
      ok: true,
      item: data,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as WorkspaceNoteBody;
    const id = body.id?.trim() ?? "";
    const title = body.title?.trim() ?? "";
    const noteBody = body.body?.trim() ?? "";

    if (!id) {
      return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }

    const active = await requireActiveAdminContext();
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("workspace_notes")
      .update({
        title,
        body: noteBody,
        updated_by_user_id: user.id,
        updated_by_email: user.email ?? null,
      })
      .eq("id", id)
      .eq("tenant_id", active.tenantId)
      .eq("brand_id", active.brandId)
      .eq("workspace_id", active.workspaceId)
      .select("id, tenant_id, brand_id, workspace_id, title, body, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    try {
      await logAdminAuditEvent({
        event: "admin_workspace_note_updated",
        actorUserId: user.id,
        actorEmail: user.email ?? null,
        tenantId: active.tenantId,
        brandId: active.brandId,
        workspaceId: active.workspaceId,
        payload: {
          noteId: data.id,
          title: data.title,
        },
      });
    } catch (auditError) {
      console.error("Failed to write workspace note update audit event", auditError);
    }

    return NextResponse.json({
      ok: true,
      item: data,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}