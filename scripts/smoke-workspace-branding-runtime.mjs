import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseDotEnv(text) {
  const result = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    result[key] = value;
  }
  return result;
}

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return {};
  return parseDotEnv(readFileSync(envPath, "utf8"));
}

function resolveAdminSecret(localEnv) {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_API_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    localEnv.ADMIN_SECRET ||
    localEnv.ADMIN_PASSWORD ||
    localEnv.ADMIN_API_PASSWORD ||
    localEnv.NEXT_PUBLIC_ADMIN_PASSWORD ||
    ""
  ).trim();
}

async function fetchJson(url, options = {}, expectedStatus = 200) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 300)}`);
  }
  if (response.status !== expectedStatus) throw new Error(`${url} returned ${response.status}; expected ${expectedStatus}: ${JSON.stringify(json)}`);
  return json;
}

function assertWorkspaceDisplayName(path, payload) {
  if (!payload || typeof payload !== "object") throw new Error(`${path} did not return an object payload`);
  if (typeof payload.workspaceDisplayName !== "string" || payload.workspaceDisplayName.trim().length === 0) throw new Error(`${path} missing workspaceDisplayName`);
}

const localEnv = loadLocalEnv();
const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const adminSecret = resolveAdminSecret(localEnv);
let failures = 0;

try {
  const health = await fetchJson(`${baseUrl}/api/health`);
  assertWorkspaceDisplayName('/api/health', health);
  console.log(`OK  /api/health  workspaceDisplayName="${health.workspaceDisplayName}"`);
} catch (error) {
  failures += 1;
  console.error(`FAIL /api/health :: ${error instanceof Error ? error.message : String(error)}`);
}

for (const path of ['/api/bootstrap/admin', '/api/bootstrap/seed', '/api/bootstrap/neejee-seed']) {
  try {
    const payload = await fetchJson(`${baseUrl}${path}`, {}, 410);
    if (payload?.code !== 'legacy_bootstrap_retired') throw new Error(`${path} did not return legacy_bootstrap_retired`);
    console.log(`OK  ${path}  retired=410`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${path} :: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (adminSecret) {
  try {
    const payload = await fetchJson(`${baseUrl}/api/admin/health`, { headers: { 'x-admin-secret': adminSecret } });
    assertWorkspaceDisplayName('/api/admin/health', payload);
    console.log(`OK  /api/admin/health  workspaceDisplayName="${payload.workspaceDisplayName}"`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL /api/admin/health :: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) process.exit(1);
console.log('PASS workspace branding + retired bootstrap security smoke');
