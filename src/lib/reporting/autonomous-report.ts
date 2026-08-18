import crypto from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type AutonomousReportTarget = {
  tenantId: string
  brandId: string
  workspaceId: string
}

export type AutonomousReportPublishInput = {
  snapshotId: string
  format?: 'web'
  audience?: 'client' | 'internal' | 'exec'
  actor: string
}

function publicationId(target: AutonomousReportTarget, snapshotId: string) {
  return `report_pub_${crypto.createHash('sha256').update(`${target.tenantId}|${target.workspaceId}|${snapshotId}`).digest('hex').slice(0, 24)}`
}

export async function publishVerifiedReportSnapshot(target: AutonomousReportTarget, input: AutonomousReportPublishInput) {
  const snapshotId = input.snapshotId.trim()
  if (!snapshotId) throw new Error('report_snapshot_id_required')
  const admin = createSupabaseAdminClient()
  const { data: snapshot, error: snapshotError } = await admin.from('report_snapshots')
    .select('*')
    .eq('report_snapshot_id', snapshotId)
    .eq('tenant_id', target.tenantId)
    .eq('brand_id', target.brandId)
    .eq('workspace_id', target.workspaceId)
    .maybeSingle()
  if (snapshotError || !snapshot) throw new Error('report_snapshot_not_found')
  if (snapshot.status === 'archived') throw new Error('report_snapshot_archived')
  if (!snapshot.source_kpi_run_id) throw new Error('report_verified_kpi_source_required')

  const { data: kpi, error: kpiError } = await admin.from('analytics_kpi_runs')
    .select('kpi_run_id,status,tenant_id,brand_id,workspace_id,report_period_start,report_period_end,source')
    .eq('kpi_run_id', snapshot.source_kpi_run_id)
    .eq('tenant_id', target.tenantId)
    .eq('brand_id', target.brandId)
    .eq('workspace_id', target.workspaceId)
    .maybeSingle()
  if (kpiError || !kpi) throw new Error('report_kpi_source_not_found')
  if (kpi.status !== 'finalized') throw new Error(`report_kpi_source_not_finalized:${kpi.status}`)

  const now = new Date().toISOString()
  const audience = input.audience || snapshot.audience
  if (!['client', 'internal', 'exec'].includes(audience)) throw new Error('report_audience_invalid')
  const id = publicationId(target, snapshotId)
  const { data: job, error: jobError } = await admin.from('report_publication_jobs').upsert({
    report_publication_job_id: id,
    tenant_id: target.tenantId,
    brand_id: target.brandId,
    workspace_id: target.workspaceId,
    report_name: snapshot.report_name,
    audience,
    format: 'web',
    decision: 'ready',
    blocked_reasons: [],
    status: 'published',
    updated_at: now,
  }, { onConflict: 'report_publication_job_id' }).select('*').single()
  if (jobError) throw new Error(`report_publication_job_write_failed:${jobError.message}`)

  const { data: published, error: publishError } = await admin.from('report_snapshots').update({
    status: 'published',
    approved_by: input.actor,
    updated_at: now,
  }).eq('report_snapshot_id', snapshotId).select('*').single()
  if (publishError) throw new Error(`report_snapshot_publish_failed:${publishError.message}`)

  return {
    publicationJobId: job.report_publication_job_id,
    snapshotId,
    status: 'published',
    format: 'web',
    audience,
    sourceKpiRunId: kpi.kpi_run_id,
    reportPeriod: { start: kpi.report_period_start, end: kpi.report_period_end },
    source: kpi.source,
    published,
  }
}
