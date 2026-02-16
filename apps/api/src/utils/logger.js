function log(...args) {
  console.log("[api]", ...args);
}

function warn(...args) {
  console.warn("[api]", ...args);
}

function error(...args) {
  console.error("[api]", ...args);
}

module.exports = { log, warn, error };
