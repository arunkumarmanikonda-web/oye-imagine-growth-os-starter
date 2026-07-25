import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import net from "node:net";

function log(message) {
  console.log(`[branding-ci] ${message}`);
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

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const address = server.address();
      const port =
        address && typeof address === "object" ? address.port : null;

      server.close((error) => {
        if (error) reject(error);
        else if (!port) reject(new Error("Failed to resolve free port"));
        else resolve(port);
      });
    });
  });
}

async function waitForUrl(url, serverRef, timeoutMs = 120000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (serverRef.exited) {
      throw new Error(
        `next start exited early with code ${serverRef.exitCode ?? "unknown"}`
      );
    }

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

async function main() {
  let server = null;

  try {
    const port = String(process.env.SMOKE_PORT || (await getFreePort()));
    const baseUrl = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`;

    log(`starting next start on ${baseUrl}`);
    server = spawnNpm(["run", "start", "--", "-p", port], { PORT: port }, true);

    const serverRef = {
      exited: false,
      exitCode: null,
    };

    server.on("error", (error) => {
      console.error(
        `[branding-ci] server process error: ${error instanceof Error ? error.message : String(error)}`
      );
    });

    server.on("exit", (code) => {
      serverRef.exited = true;
      serverRef.exitCode = code;
    });

    const ready = await waitForUrl(`${baseUrl}/api/health`, serverRef, 120000);
    if (!ready) {
      throw new Error(`server did not become ready at ${baseUrl}/api/health`);
    }

    log("server ready, running runtime smoke");
    await runNpm(["run", "smoke:workspace-branding-runtime"], {
      SMOKE_BASE_URL: baseUrl,
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