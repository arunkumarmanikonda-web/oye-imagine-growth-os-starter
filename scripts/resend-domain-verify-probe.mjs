const domainName = 'oyeimagine.com'
const testRecipient = 'akm@indiagully.com'
const apiKey = String(process.env.RESEND_API_KEY || '').trim()

if (!apiKey) {
  console.log('RESEND_VERIFY_PROBE no_api_key_in_this_build_environment')
  process.exit(0)
}

const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }

async function readJson(response) {
  const payload = await response.json().catch(() => ({}))
  return { ok: response.ok, status: response.status, payload }
}

const list = await fetch('https://api.resend.com/domains', { headers, cache: 'no-store' }).then(readJson)
if (!list.ok) throw new Error(`Resend list domains failed: ${list.status}`)
const domain = Array.isArray(list.payload?.data)
  ? list.payload.data.find((item) => String(item?.name || '').toLowerCase() === domainName)
  : null
if (!domain?.id) throw new Error('Resend domain not found')

const verify = await fetch(`https://api.resend.com/domains/${encodeURIComponent(domain.id)}/verify`, {
  method: 'POST',
  headers,
  cache: 'no-store',
}).then(readJson)
console.log(`RESEND_VERIFY_PROBE verify_http=${verify.status}`)

let detail
for (let i = 0; i < 6; i += 1) {
  detail = await fetch(`https://api.resend.com/domains/${encodeURIComponent(domain.id)}`, {
    headers,
    cache: 'no-store',
  }).then(readJson)
  const status = String(detail.payload?.status || 'unknown')
  console.log(`RESEND_VERIFY_PROBE domain_status=${status}`)
  if (status === 'verified') break
  await new Promise((resolve) => setTimeout(resolve, 3000))
}

if (String(detail?.payload?.status || '') === 'verified') {
  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: 'Oye !magine <hello@oyeimagine.com>',
      to: [testRecipient],
      subject: 'Oye Imagine email channel verified',
      html: '<p>Oye Imagine transactional email is now verified and operational.</p>',
      text: 'Oye Imagine transactional email is now verified and operational.',
    }),
    cache: 'no-store',
  }).then(readJson)
  console.log(`RESEND_VERIFY_PROBE test_send_http=${send.status}`)
  if (send.ok && send.payload?.id) console.log('RESEND_VERIFY_PROBE test_send_accepted')
}
