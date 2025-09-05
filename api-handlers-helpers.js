const { spawn } = require("child_process");

// Intentamos obtener la ruta del Chrome instalado por puppeteer
let chromePath = null;
try {
  const puppeteer = require("puppeteer");
  if (puppeteer && typeof puppeteer.executablePath === "function") {
    chromePath = puppeteer.executablePath();
    console.log("[speedtest] Chrome path:", chromePath);
  }
} catch (_) {
  console.warn("[speedtest] puppeteer no disponible para resolver executablePath");
}

exports.runCommand = function runCommand(cmd, args = [], {
  timeoutMs = 60_000,
  maxBytes  = 256 * 1024,
} = {}) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      // aseguramos el mismo cache path que se usó en el build
      PUPPETEER_CACHE_DIR: process.env.PUPPETEER_CACHE_DIR || "/opt/render/.cache/puppeteer",
      PUPPETEER_BROWSER: "chrome",
    };
    // Seteamos ambas por compatibilidad (muchas libs honran una u otra)
    if (chromePath) {
      env.PUPPETEER_EXECUTABLE_PATH = chromePath;
      env.CHROME_PATH = chromePath;
    }

    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], env });

    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Timeout ejecutando comando"));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      if (stdout.length + chunk.length <= maxBytes) stdout = Buffer.concat([stdout, chunk]);
    });
    child.stderr.on("data", (chunk) => {
      if (stderr.length + chunk.length <= maxBytes) stderr = Buffer.concat([stderr, chunk]);
    });

    child.on("error", (err) => { clearTimeout(timer); reject(err); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && stderr.length) return resolve({ status: 400, data: stderr.toString("utf8") });
      return resolve({ status: 200, data: stdout.toString("utf8") });
    });
  });
};
