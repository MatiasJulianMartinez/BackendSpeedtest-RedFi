// Frontend/speedtest-server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));

// ---------- Health ----------
app.get("/health", (_req, res) => res.status(200).send("ok"));

// ---------- Endpoints livianos (miden DESDE el navegador del usuario) ----------
const KB = 1024;
const MB = 1024 * KB;
const CHUNK = Buffer.alloc(64 * KB); // se reutiliza para no crecer en RAM

// Descarga: stream de N MB para medir "download" del usuario
app.get("/speedtest/download", (req, res) => {
  const sizeMb = Math.min(Math.max(parseInt(req.query.size || "25", 10), 5), 200); // 5..200 MB
  const total = sizeMb * MB;

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Length", String(total));
  // si usás algún middleware de compresión global, asegúrate de no comprimir esta ruta
  // res.setHeader("Content-Encoding", "identity");

  let sent = 0;
  function pump() {
    while (sent < total) {
      const rem = total - sent;
      const chunk = rem >= CHUNK.length ? CHUNK : CHUNK.subarray(0, rem);
      const ok = res.write(chunk);
      sent += chunk.length;
      if (!ok) return res.once("drain", pump);
    }
    res.end();
  }
  pump();
});

// Subida: recibimos bytes y los descartamos para medir "upload" del usuario
app.post("/speedtest/upload", (req, res) => {
  let received = 0;
  req.on("data", (c) => {
    received += c.length;
    // cota de seguridad (máx 300 MB)
    if (received > 300 * MB) req.destroy();
  });
  req.on("end", () => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ received }));
  });
});

// ---------- Compat ----------
app.get("/", (_req, res) => res.redirect("/health"));

app.listen(PORT, () => console.log("Listening on port", PORT));
