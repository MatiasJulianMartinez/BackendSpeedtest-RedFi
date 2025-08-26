const { spawn } = require("child_process");
const path = require("path");

exports.getExecOutput = (args = [], opts = {}) =>
  new Promise((resolve) => {
    // ⬇️ 45s máximo: deja margen al proxy de Render
    const timeoutMs = opts.timeoutMs ?? 45_000;

    // Usa el binario local (sin npx)
    const fastCli = path.resolve(__dirname, "node_modules", "fast-cli", "cli.js");

    // ⬅️ claves: --upload --json --timeout=30
    const finalArgs = ["--upload", "--json", "--timeout=30", ...args];

    let stdout = "", stderr = "", timedOut = false;

    const child = spawn(process.execPath, [fastCli, ...finalArgs], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill("SIGKILL"); } catch {}
      resolve({ status: 504, data: "timeout: fast-cli > 45s" });
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
