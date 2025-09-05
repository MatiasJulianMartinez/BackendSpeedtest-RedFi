require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testSpeedHandler } = require("./api-handlers");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));

// health para Render
app.get("/health", (_req, res) => res.status(200).send("ok"));

// evita que alguien spamee el test
let isBusy = false;
app.get("/api/speedtest", async (_req, res) => {
  if (isBusy) {
    return res.status(429).json({ error: "Hay un test en ejecución. Probá en unos segundos." });
  }
  isBusy = true;
  try {
    const r = await testSpeedHandler();
    res.status(r.status).send(r.data);
  } catch (err) {
    console.error("Speedtest error:", err);
    res.status(500).json({ error: "Speedtest failed" });
  } finally {
    isBusy = false;
  }
});

// compat
app.get("/", (_req, res) => res.redirect("/health"));

app.listen(PORT, () => console.log("Listening on port", PORT));
