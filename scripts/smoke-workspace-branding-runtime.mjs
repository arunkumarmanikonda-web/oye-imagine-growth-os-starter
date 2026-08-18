const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const expectedWorkspaceDisplayName = (process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME || 'Oye Imagine').trim()

async function fetchResponse(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' })
  const text = await response.text()
  return { response, text }
}

async function assertHealthBranding() {
  const path = '/api/health'
  const { response, text } = await fetchResponse(path)
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)

  let payload
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`${path} returned non-JSON content: ${text.slice(0, 200)}`)
  }

  if (!payload || payload.ok !== true) throw new Error(`${path} missing ok=true`)
  if (payload.workspaceDisplayName !== expectedWorkspaceDisplayName) {
    throw new Error(`${path} workspaceDisplayName=${JSON.stringify(payload.workspaceDisplayName)} expected=${JSON.stringify(expectedWorkspaceDisplayName)}`)
  }

  console.log(`OK  ${path}  workspaceDisplayName=${JSON.stringify(payload.workspaceDisplayName)}`)
}

async function assertPublicBranding() {
  const path = '/'
  const { response, text } = await fetchResponse(path)
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)
  if (!text.includes('Oye !magine')) throw new Error(`${path} missing public Oye !magine branding`)
  console.log(`OK  ${path}  public brand rendered`)
}

async function assertRetiredRouteAbsent(path) {
  const { response } = await fetchResponse(path)
  if (response.status !== 404) {
    throw new Error(`${path} returned ${response.status}; retired bootstrap surface must return 404`)
  }
  console.log(`OK  ${path}  retired surface absent (404)`)
}

const retiredBootstrapRoutes = [
  '/api/bootstrap/admin',
  '/api/bootstrap/seed',
  '/api/bootstrap/neejee-seed',
]

let failures = 0

for (const check of [assertHealthBranding, assertPublicBranding]) {
  try {
    await check()
  } catch (error) {
    failures += 1
    console.error(`FAIL branding :: ${error instanceof Error ? error.message : String(error)}`)
  }
}

for (const path of retiredBootstrapRoutes) {
  try {
    await assertRetiredRouteAbsent(path)
  } catch (error) {
    failures += 1
    console.error(`FAIL ${path} :: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures > 0) process.exit(1)

console.log(`PASS workspace branding + production surface smoke (${2 + retiredBootstrapRoutes.length} checks)`)
