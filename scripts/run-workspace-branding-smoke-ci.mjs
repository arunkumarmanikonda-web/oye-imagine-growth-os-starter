import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = process.env.SMOKE_PORT || "3100";
const baseUrl = process.env.SMOKE_BASE_URL || `http://localhost:${port}`;

function log(message) {
  console.log(`[branding-ci] ${message}`);
}

async function waitForUrl(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status >= 200 && response.status < 500) {
        return true;
      }
    } catch {}
    await delay(2000);
  }
  return false;
}

function spawnNpm(args, extraEnv = {}, inherit = true) {
  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/c", "npm", ...args], {
      stdio: inherit ? "inherit" : "pipe",
      shell: false,
      env: { ...process.env, ...extraEnv },
    });
  }

  return spawn("npm", args, {
    stdio: inherit ? "inherit" : "pipe",
    shell: false,
    env: { ...process.env, ...extraEnv },
  });
}

function runNpm(args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnNpm(args, extraEnv, true);

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  let server = null;

  try {
    log(`starting next start on http://localhost:${port}`);
    server = spawnNpm(["run", "start", "--", "-p", port], { PORT: port }, true);

    server.on("error", (error) => {
      console.error(`[branding-ci] server process error: ${error instanceof Error ? error.message : String(error)}`);
    });

    const ready = await waitForUrl(`http://localhost:${port}/api/health`, 120000);
    if (!ready) {
      throw new Error(`server did not become ready at http://localhost:${port}/api/health`);
    }

    log("server ready, running runtime smoke");
    await runNpm(["run", "smoke:workspace-branding-runtime"], {
      SMOKE_BASE_URL: `http://localhost:${port}`,
    });

    log("workspace branding CI smoke passed");
  } finally {
    if (server && !server.killed) {
      log("stopping next start server");
      try { server.kill("SIGTERM"); } catch {}
      await delay(2000).catch(() => {});
      if (!server.killed) {
        try { server.kill("SIGKILL"); } catch {}
      }
    }
  }
}

main().catch((error) => {
  console.error(`[branding-ci] FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});