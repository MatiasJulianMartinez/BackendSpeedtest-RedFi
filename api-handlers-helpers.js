// api-handlers-helpers.js
const { exec } = require("child_process");

class OS {
  execCommand(cmd) {
    return new Promise((resolve, reject) => {
      // Aumentamos el timeout por si el test tarda
      exec(cmd, { maxBuffer: 1024 * 1024, timeout: 90_000 }, (err, stdout, stderr) => {
        if (err) return reject(err);
        if (stderr && !stdout) return reject(new Error(stderr));
        return resolve(stdout || "");
      });
    });
  }
}

exports.getExecOutput = async function getExecOutput(command) {
  const os = new OS();
  try {
    const out = await os.execCommand(command);
    return { status: 200, data: out };
  } catch (err) {
    return { status: 400, data: String(err && err.message ? err.message : err) };
  }
};
