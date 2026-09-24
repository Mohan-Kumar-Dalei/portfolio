// Local / long-running Node entry. On Vercel, api/index.js uses app.js directly.
const app = require("./app");
const { ensureReady } = require("./app");

// Safety nets: log instead of crashing the process
process.on("unhandledRejection", (reason) => console.error("[unhandledRejection]", reason));
process.on("uncaughtException", (err) => console.error("[uncaughtException]", err));

const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await ensureReady();
    app.listen(PORT, "0.0.0.0", () => console.log(`[server] Express API listening on ${PORT}`));
  } catch (err) {
    console.error("[fatal] Failed to start server", err);
    process.exit(1);
  }
})();
