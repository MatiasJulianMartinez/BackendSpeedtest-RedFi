const os = require("os");
const speedTest = require("speedtest-net");

const toMbps = (bytesPerSec) => (bytesPerSec * 8) / 1e6;

exports.testSpeedHandler = async () => {
  try {
    // Aceptamos términos para evitar bloqueos en servidores CI/hosting
    const result = await speedTest({
      acceptLicense: true,
      acceptGdpr: true,
      verbosity: 0
    });

    const download = result?.download?.bandwidth ?? 0;
    const upload   = result?.upload?.bandwidth ?? 0;
    const ping     = result?.ping?.latency ?? null;

    return {
      status: 200,
      data: {
        downloadSpeed: Number(toMbps(download).toFixed(2)), // Mbps
        uploadSpeed:   Number(toMbps(upload).toFixed(2)),   // Mbps
        latency:       ping,                                // ms
        isp:           result?.isp ?? null,
        serverName:    result?.server?.name ?? null,
        interface:     result?.interface?.name ?? null,
        server:        os.hostname(),
        os:            process.platform
      }
    };
  } catch (e) {
    return { status: 400, data: { error: String(e?.message || e) } };
  }
};
