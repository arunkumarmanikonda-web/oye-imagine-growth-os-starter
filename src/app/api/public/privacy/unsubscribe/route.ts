import { NextRequest } from 'next/server'
import { applyPublicUnsubscribe, verifyUnsubscribeToken } from '@/lib/privacy/consent'
import { readBoundedBody } from '@/lib/security/bounded-json'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ONE_CLICK_BODY_BYTES = 2_048

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  })
}

function page(title: string, message: string, form = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f7f7f5;color:#151515}
main{max-width:560px;margin:12vh auto;padding:32px;background:#fff;border:1px solid #e5e5e0;border-radius:18px}
h1{font-size:28px;margin:0 0 14px}p{line-height:1.6;margin:0 0 22px}button{border:0;border-radius:999px;padding:12px 18px;font-weight:700;cursor:pointer;background:#151515;color:#fff}
</style>
</head>
<body><main><h1>${title}</h1><p>${message}</p>${form}</main></body>
</html>`
}

function tokenFrom(request: NextRequest) {
  return request.nextUrl.searchParams.get('token')?.trim() || ''
}

export async function GET(request: NextRequest) {
  const token = tokenFrom(request)
  if (!token) {
    return htmlResponse(page('Unsubscribe link unavailable', 'This unsubscribe link is invalid or expired.'), 400)
  }

  try {
    verifyUnsubscribeToken(token)
  } catch {
    return htmlResponse(page('Unsubscribe link unavailable', 'This unsubscribe link is invalid or expired.'), 400)
  }

  const action = `/api/public/privacy/unsubscribe?token=${encodeURIComponent(token)}`
  const form = `<form method="post" action="${action}"><input type="hidden" name="List-Unsubscribe" value="One-Click" /><button type="submit">Confirm unsubscribe</button></form>`
  return htmlResponse(page('Confirm unsubscribe', 'Confirm that you no longer want to receive these messages.', form))
}

export async function POST(request: NextRequest) {
  const token = tokenFrom(request)
  if (!token) {
    return htmlResponse(page('Unsubscribe link unavailable', 'This unsubscribe link is invalid or expired.'), 400)
  }

  const body = await readBoundedBody(request, MAX_ONE_CLICK_BODY_BYTES)
  if (!body.ok) {
    return htmlResponse(
      page('Unsubscribe request unavailable', body.code === 'payload_too_large' ? 'The unsubscribe request was too large.' : 'The unsubscribe request was invalid.'),
      body.code === 'payload_too_large' ? 413 : 400,
    )
  }

  const params = new URLSearchParams(new TextDecoder().decode(body.bytes))
  if (params.get('List-Unsubscribe') !== 'One-Click') {
    return htmlResponse(page('Confirmation required', 'Please use the confirmation button in the unsubscribe page.'), 400)
  }

  try {
    const result = await applyPublicUnsubscribe(token)
    return htmlResponse(
      page(
        'Unsubscribed',
        result.alreadyApplied
          ? 'This preference was already applied. No further action is required.'
          : 'Your unsubscribe preference has been applied.',
      ),
    )
  } catch {
    return htmlResponse(page('Unsubscribe request unavailable', 'This unsubscribe link is invalid, expired, or could not be applied.'), 400)
  }
}
