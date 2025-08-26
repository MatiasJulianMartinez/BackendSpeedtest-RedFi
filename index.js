const express = require("express");
const os = require("os");
const { testSpeedHandler } = require("./api-handlers");

const app = express();

// ====== CORS (siempre antes de rutas) ======
const ALLOWED_ORIGINS = [
  "https://frontend-redfi.onrender.com", // tu Static Site de Render
  // agrega acá otros dominios del front si los usás
];

app.use((req, res, next) => {
  res.header("Vary", "Origin");
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ====== Health ======
app.get("/", (_, res) => res.send("Speedtest server up"));
app.get("/health", (_, res) => res.status(200).send("OK"));

// ====== API ======
app.get("/api/speedtest", async (req, res, next) => {
  try {
    const { status, data } = await testSpeedHandler();
    res.status(status).json(data);
  } catch (e) {
    next(e);
  }
});

// ====== Error handler (CORS también en errores) ======
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.status(500).json({ error: "server_error", detail: err?.message });
});

// ====== Start ======
const PORT = process.env.PORT || 8000; // Render setea PORT
app.listen(PORT, () => {
  console.log(`Speedtest server listening on ${PORT} - host: ${os.hostname()}`);
});
