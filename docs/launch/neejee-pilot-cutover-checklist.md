# Neejee Pilot Cutover Checklist

## Pre-cutover
- production environment variables verified
- Supabase migrations applied in order
- tenant, brand, and workspace records created
- feature entitlements verified for pilot tenant
- approval policies verified for commercial and publishing actions
- AI routing defaults verified
- landing page draft, campaign draft, SEO brief, social calendar, and reporting flows smoke-tested

## Commercial controls
- contract activation state verified
- subscription activation state verified
- invoice lifecycle verified
- audit events verified
- usage quota thresholds verified
- approval trails verified

## Launch gate
- validation suite green
- no critical health incidents open
- no blocking launch readiness checks open
- rollback owner assigned
- support contact assigned
- pilot handoff scheduled