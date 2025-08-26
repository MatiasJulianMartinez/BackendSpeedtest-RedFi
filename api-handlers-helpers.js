const { spawn } = require("child_process");
const path = require("path");

/**
 * Ejecuta fast-cli SIN npx (binario local) y corta < 60s para evitar 502 del proxy.
 * Devuelve { status, data } siempre (200/500/504).
 */
exports.getExecOutput = (args = ["-u", "--json"], opts = {}) =>
  new Promise((resolve) => {
    const timeoutMs = opts.timeoutMs ?? 55_000; // < 60s
    const fastCli = path.resolve(__dirname, "node_modules", "fast-cli", "cli.js");

    let stdout = "", stderr = "", timedOut = false;

    const child = spawn(process.execPath, [fastCli, ...args], {
      env: process.env
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill("SIGKILL"); } catch {}
      resolve({ status: 504, data: "timeout: fast-cli tardó demasiado" });
    }, timeoutMs);

    child.stdout.on("data", (c) => (stdout += c.toString()));
    child.stderr.on("data", (c) => (stderr += c.toString()));

    child.on("error", (err) => {
      clearTimeout(timer);
      if (!timedOut) resolve({ status: 500, data: `spawn_failed: ${err.message}` });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) return;
      if (code !== 0) {
        resolve({ status: 500, data: `fast_cli_failed (code ${code})\n${stderr}` });
      } else {
        resolve({ status: 200, data: stdout });
      }
    });
  });
