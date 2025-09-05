const os = require("os");
const { runCommand } = require("./api-handlers-helpers");

function safeParse(x) {
  try { return JSON.parse(x); } catch { return null; }
}

exports.testSpeedHandler = async () => {
  // Llamamos al binario local, evitando “npx” (que aumenta consumo)
  const cmd = process.platform === "win32"
    ? ".\\node_modules\\.bin\\fast.cmd"
    : "./node_modules/.bin/fast";

  const out = await runCommand(cmd, ["--upload", "--json"], {
    timeoutMs: 60_000,
    maxBytes: 256 * 1024,
  });

  if (typeof out.data === "string" && out.data.includes("Please check your internet connection")) {
    return { status: 400, data: { error: "Sin conexión a Internet" } };
  }
  if (out.status !== 200) {
    return { status: 400, data: { error: String(out.data || "falló fast-cli") } };
  }

  const parsed = safeParse(out.data);
  if (!parsed) {
    return { status: 400, data: { error: "Salida no JSON de fast-cli", raw: out.data } };
  }

  return { status: 200, data: { ...parsed, server: os.hostname(), os: process.platform } };
};
