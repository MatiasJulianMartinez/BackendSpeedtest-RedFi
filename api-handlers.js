const { getExecOutput } = require("./api-handlers-helpers");

exports.testSpeedHandler = async () => {
  // no aumentes acá el timeout; el helper ya limita a 45s
  const r = await getExecOutput();

  if (r.status !== 200) {
    return {
      status: r.status,
      data: { error: "speedtest_error", detail: String(r.data).slice(0, 800) },
    };
  }

  try {
    const json = JSON.parse(r.data);
    return { status: 200, data: json };
  } catch (e) {
    return { status: 500, data: { error: "parse_failed", raw: String(r.data).slice(0, 800) } };
  }
};
