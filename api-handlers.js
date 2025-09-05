// api-handlers.js
const { getExecOutput } = require("./api-handlers-helpers");
const os = require("os");

function safeParseJson(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
}

exports.testSpeedHandler = async () => {
  const cmd = "npx fast --upload --json";
  const testCommandOutput = await getExecOutput(cmd);

  // Error típico sin internet
  if (testCommandOutput.data.includes("Please check your internet connection")) {
    return { status: 400, data: { error: "Sin conexión a Internet" } };
  }

  if (testCommandOutput.status !== 200) {
    return { status: 400, data: { error: testCommandOutput.data } };
  }

  const parsed = safeParseJson(testCommandOutput.data);
  if (!parsed) {
    // Devolvemos la salida cruda para debug si no es JSON
    return { status: 400, data: { error: "Salida no JSON de fast-cli", raw: testCommandOutput.data } };
  }

  return {
    status: 200,
    data: {
      ...parsed,
      server: os.hostname(),
      os: process.platform,
    },
  };
};
