// api-handlers.js
const os = require("os");
const speedTest = require("speedtest-net");

function mbps(bytesPerSec) {
  // bytes/s -> Mbps
  return (bytesPerSec * 8) / 1e6;
}

exports.testSpeedHandler = async () => {
  try {
    const result = await speedTest({
      acceptLicense: true,
      acceptGdpr: true,
      // duraciones cortas para plan Free
      downloadDuration: 6,
      uploadDuration: 6,
    });

    const download = mbps(result.download?.bandwidth || 0);
    const upload   = mbps(result.upload?.bandwidth || 0);
    const ping     = result.ping?.latency ?? null;

    return {
      status: 200,
      data: {
        downloadSpeed: Number(download.toFixed(2)), // Mbps
        uploadSpeed:   Number(upload.toFixed(2)),   // Mbps
        latency:       ping,                        // ms
        isp:           result.isp || null,
        serverName:    result.server?.name || null,
        interface:     result.interface?.name || null,
        server:        os.hostname(),
        os:            process.platform
      }
    };
  } catch (e) {
    return { status: 400, data: { error: String(e?.message || e) } };
  }
};
