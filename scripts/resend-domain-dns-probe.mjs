const domainName = 'oyeimagine.com'
const teamId = 'team_QSIyuQ3mwCKAAxaBkmJBCTSK'
const oidcToken = String(process.env.VERCEL_OIDC_TOKEN || '').trim()

if (!oidcToken) {
  console.log('VERCEL_DNS_OIDC no_oidc_token_in_this_build_environment')
} else {
  const dnsProbe = await fetch(`https://api.vercel.com/v4/domains/${domainName}/records?teamId=${encodeURIComponent(teamId)}&limit=1`, {
    headers: { Authorization: `Bearer ${oidcToken}` },
    cache: 'no-store',
  })
  console.log(`VERCEL_DNS_OIDC status=${dnsProbe.status}`)
}

const apiKey = String(process.env.RESEND_API_KEY || '').trim()

if (!apiKey) {
  console.log('RESEND_DNS_PROBE no_api_key_in_this_build_environment')
  process.exit(0)
}

const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const type = typeof payload?.name === 'string' ? payload.name : 'provider_error'
    throw new Error(`Resend ${response.status} ${type}`)
  }
  return payload
}

const listResponse = await fetch('https://api.resend.com/domains', {
  headers,
  cache: 'no-store',
})
const list = await readJson(listResponse)
let domain = Array.isArray(list?.data)
  ? list.data.find((item) => String(item?.name || '').toLowerCase() === domainName)
  : null

if (!domain) {
  const createResponse = await fetch('https://api.resend.com/domains', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: domainName, region: 'us-east-1' }),
    cache: 'no-store',
  })
  domain = await readJson(createResponse)
  console.log('RESEND_DNS_PROBE domain_created')
}

if (!domain?.id) throw new Error('Resend domain id unavailable')

const detailResponse = await fetch(`https://api.resend.com/domains/${encodeURIComponent(domain.id)}`, {
  headers,
  cache: 'no-store',
})
const detail = await readJson(detailResponse)

console.log(`RESEND_DNS_PROBE domain=${domainName} status=${String(detail?.status || 'unknown')}`)
for (const record of Array.isArray(detail?.records) ? detail.records : []) {
  const safeRecord = {
    record: record?.record || null,
    type: record?.type || null,
    name: record?.name || null,
    value: record?.value || null,
    priority: record?.priority ?? null,
    ttl: record?.ttl ?? null,
    status: record?.status || null,
  }
  console.log(`RESEND_DNS_RECORD ${JSON.stringify(safeRecord)}`)
}
