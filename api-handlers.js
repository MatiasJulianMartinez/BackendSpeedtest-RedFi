const { getExecOutput } = require("./api-handlers-helpers");

exports.testSpeedHandler = async () => {
  const r = await getExecOutput(["-u", "--json"], { timeoutMs: 55_000 });

  if (r.status !== 200) {
    return {
      status: r.status,
      data: { error: "speedtest_error", detail: String(r.data).slice(0, 800) }
    };
  }

  try {
    const json = JSON.parse(r.data);
    // fast-cli retorna { downloadSpeed, uploadSpeed, latency, server, ... }
    return { status: 200, data: json };
  } catch (e) {
    return { status: 500, data: { error: "parse_failed", raw: String(r.data).slice(0, 800) } };
  }
};
