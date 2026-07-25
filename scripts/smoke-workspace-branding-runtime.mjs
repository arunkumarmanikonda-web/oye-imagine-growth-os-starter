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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 300)}`);
  }

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${JSON.stringify(json)}`);
  }

  return json;
}

function assertWorkspaceDisplayName(path, payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error(`${path} did not return an object payload`);
  }

  if (
    typeof payload.workspaceDisplayName !== "string" ||
    payload.workspaceDisplayName.trim().length === 0
  ) {
    throw new Error(`${path} missing workspaceDisplayName`);
  }
}

const localEnv = loadLocalEnv();
const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const adminSecret = resolveAdminSecret(localEnv);

const jobs = [
  { path: "/api/bootstrap/admin", headers: {} },
  { path: "/api/bootstrap/seed", headers: {} },
  { path: "/api/bootstrap/neejee-seed", headers: {} },
];

if (adminSecret) {
  jobs.push({
    path: "/api/admin/health",
    headers: { "x-admin-secret": adminSecret },
  });
}

let failures = 0;

for (const job of jobs) {
  const url = `${baseUrl}${job.path}`;
  try {
    const json = await fetchJson(url, { headers: job.headers });
    assertWorkspaceDisplayName(job.path, json);
    console.log(`OK  ${job.path}  workspaceDisplayName="${json.workspaceDisplayName}"`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${job.path} :: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`PASS workspace branding runtime smoke (${jobs.length} endpoints)`);