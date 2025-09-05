const { spawn } = require("child_process");

// Ejecuta un comando “streameando” stdout/stderr para no llenar RAM
exports.runCommand = function runCommand(cmd, args = [], {
  timeoutMs = 60_000,      // 60s
  maxBytes = 256 * 1024,   // 256 KB máx acumulado
} = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Timeout ejecutando comando"));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      if (stdout.length + chunk.length <= maxBytes) {
        stdout = Buffer.concat([stdout, chunk]);
      }
    });
    child.stderr.on("data", (chunk) => {
      if (stderr.length + chunk.length <= maxBytes) {
        stderr = Buffer.concat([stderr, chunk]);
      }
    });

    child.on("error", (err) => { clearTimeout(timer); reject(err); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && stderr.length) {
        return resolve({ status: 400, data: stderr.toString("utf8") });
      }
      return resolve({ status: 200, data: stdout.toString("utf8") });
    });
  });
};
