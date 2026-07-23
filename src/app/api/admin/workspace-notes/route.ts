import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { requireAdmin } from "@/lib/admin-route";
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

function getSearchParams(request: Request) {
  return new URL(request.url).searchParams;
}

function getActorFromAdminHeaders(request: Request) {
  const actorEmail =
    request.headers.get("x-admin-email")?.trim() ||
    request.headers.get("x-forwarded-email")?.trim() ||
    null;

  return {
    actorUserId: "admin-secret",
    actorEmail,
  };
}

export async function GET(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
    const active = await requireActiveAdminContext();
    const admin = createServiceRoleClient();
    const searchParams = getSearchParams(request);

    const q = searchParams.get("q")?.trim() ?? "";
    const includeArchived = searchParams.get("includeArchived") === "true";

    let query = admin
      .from("workspace_notes")
      .select("id, tenant_id, brand_id, workspace_id, title, body, created_by_user_id, created_by_email, updated_by_user_id, updated_by_email, archived_at, archived_by_user_id, archived_by_email, created_at, updated_at")
      .eq("tenant_id", active.tenantId)
      .eq("brand_id", active.brandId)
      .eq("workspace_id", active.workspaceId)
      .order("updated_at", { ascending: false });

    if (!includeArchived) {
      query = query.is("archived_at", null);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      active,
      filters: {
        q,
        includeArchived,
      },
      items: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
    const body = (await request.json()) as WorkspaceNoteBody;
    const title = body.title?.trim() ?? "";
    const noteBody = body.body?.trim() ?? "";

    if (!title) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }

    const active = await requireActiveAdminContext();
    const admin = createServiceRoleClient();
    const actor = getActorFromAdminHeaders(request);

    const { data, error } = await admin
      .from("workspace_notes")
      .insert({
        tenant_id: active.tenantId,
        brand_id: active.brandId,
        workspace_id: active.workspaceId,
        title,
        body: noteBody,
        created_by_user_id: actor.actorUserId,
        created_by_email: actor.actorEmail,
        updated_by_user_id: actor.actorUserId,
        updated_by_email: actor.actorEmail,
      })
      .select("id, tenant_id, brand_id, workspace_id, title, body, archived_at, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    try {
      await logAdminAuditEvent({
        event: "admin_workspace_note_created",
        actorUserId: actor.actorUserId,
        actorEmail: actor.actorEmail,
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

export async function PUT(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
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
    const actor = getActorFromAdminHeaders(request);

    const { data, error } = await admin
      .from("workspace_notes")
      .update({
        title,
        body: noteBody,
        updated_by_user_id: actor.actorUserId,
        updated_by_email: actor.actorEmail,
      })
      .eq("id", id)
      .eq("tenant_id", active.tenantId)
      .eq("brand_id", active.brandId)
      .eq("workspace_id", active.workspaceId)
      .select("id, tenant_id, brand_id, workspace_id, title, body, archived_at, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    try {
      await logAdminAuditEvent({
        event: "admin_workspace_note_updated",
        actorUserId: actor.actorUserId,
        actorEmail: actor.actorEmail,
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

export async function DELETE(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
    const searchParams = getSearchParams(request);
    const id = searchParams.get("id")?.trim() ?? "";
    const mode = searchParams.get("mode")?.trim() ?? "archive";

    if (!id) {
      return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    const active = await requireActiveAdminContext();
    const admin = createServiceRoleClient();
    const actor = getActorFromAdminHeaders(request);

    if (mode === "restore") {
      const { data, error } = await admin
        .from("workspace_notes")
        .update({
          archived_at: null,
          archived_by_user_id: null,
          archived_by_email: null,
          updated_by_user_id: actor.actorUserId,
          updated_by_email: actor.actorEmail,
        })
        .eq("id", id)
        .eq("tenant_id", active.tenantId)
        .eq("brand_id", active.brandId)
        .eq("workspace_id", active.workspaceId)
        .select("id, title")
        .single();

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      try {
        await logAdminAuditEvent({
          event: "admin_workspace_note_restored",
          actorUserId: actor.actorUserId,
          actorEmail: actor.actorEmail,
          tenantId: active.tenantId,
          brandId: active.brandId,
          workspaceId: active.workspaceId,
          payload: {
            noteId: data.id,
            title: data.title,
          },
        });
      } catch (auditError) {
        console.error("Failed to write workspace note restore audit event", auditError);
      }

      return NextResponse.json({ ok: true, item: data });
    }

    const { data, error } = await admin
      .from("workspace_notes")
      .update({
        archived_at: new Date().toISOString(),
        archived_by_user_id: actor.actorUserId,
        archived_by_email: actor.actorEmail,
        updated_by_user_id: actor.actorUserId,
        updated_by_email: actor.actorEmail,
      })
      .eq("id", id)
      .eq("tenant_id", active.tenantId)
      .eq("brand_id", active.brandId)
      .eq("workspace_id", active.workspaceId)
      .is("archived_at", null)
      .select("id, title")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    try {
      await logAdminAuditEvent({
        event: "admin_workspace_note_archived",
        actorUserId: actor.actorUserId,
        actorEmail: actor.actorEmail,
        tenantId: active.tenantId,
        brandId: active.brandId,
        workspaceId: active.workspaceId,
        payload: {
          noteId: data.id,
          title: data.title,
        },
      });
    } catch (auditError) {
      console.error("Failed to write workspace note archive audit event", auditError);
    }

    return NextResponse.json({ ok: true, item: data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}