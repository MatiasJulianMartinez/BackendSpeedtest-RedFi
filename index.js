// index.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { testSpeedHandler } = require("./api-handlers");

const app = express();

// Render usa PORT, no SERVER_PORT:
const PORT = process.env.PORT || process.env.SERVER_PORT || 8000;

app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));

// Healthcheck para Render
app.get("/health", (_req, res) => res.status(200).send("ok"));

// Endpoint que espera tu frontend
app.get("/api/speedtest", async (_req, res) => {
  try {
    const speedTestData = await testSpeedHandler();
    res.status(speedTestData.status).send(speedTestData.data);
  } catch (err) {
    console.error("Speedtest error:", err);
    res.status(500).send({ error: "Speedtest failed" });
  }
});

// (opcional) Compat con tu antiguo root "/"
app.get("/", (_req, res) => res.redirect("/health"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
