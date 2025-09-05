const os = require("os");
const speedTest = require("speedtest-net");

// bps -> Mbps
const bpsToMbps = (bps) => (bps || 0) / 1_000_000;

exports.testSpeedHandler = async () => {
  try {
    const result = await speedTest({
      acceptLicense: true,
      acceptGdpr: true,
      verbosity: 0,
    });

    const dlMbps = bpsToMbps(result?.download?.bandwidth);
    const ulMbps = bpsToMbps(result?.upload?.bandwidth);
    const ping   = result?.ping?.latency ?? null;

    return {
      status: 200,
      data: {
        downloadSpeed: Number(dlMbps.toFixed(2)),
        uploadSpeed:   Number(ulMbps.toFixed(2)),
        latency:       ping,
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
