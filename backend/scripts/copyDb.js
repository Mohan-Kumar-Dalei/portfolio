/*
 * Copy every collection from one MongoDB to another, e.g. the local
 * database into the Atlas cluster used by the Vercel deployment.
 *
 *   node scripts/copyDb.js [--from=<url>] [--to=<url>] [--db=<name>] [--apply]
 *
 * Defaults: --from = local mongodb://127.0.0.1:27017, --to = MONGO_URL from
 * .env, --db = DB_NAME from .env. Dry run unless --apply is given. Target
 * collections are replaced, so run it once before going live.
 */
require("dotenv").config();
const dns = require("dns");
const { MongoClient } = require("mongoose").mongo;

const opt = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const apply = process.argv.includes("--apply");
const fromUrl = opt("from", "mongodb://127.0.0.1:27017");
const toUrl = opt("to", process.env.MONGO_URL);
const dbName = opt("db", process.env.DB_NAME);

// Some Windows resolvers refuse mongodb+srv SRV lookups; public DNS works.
if ([fromUrl, toUrl].some((u) => u && u.startsWith("mongodb+srv://"))) dns.setServers(["8.8.8.8", "1.1.1.1"]);

const hostOf = (u) => (u || "").replace(/\/\/[^@]*@/, "//").split("/")[2] || "?";

(async () => {
  if (!toUrl || !dbName) throw new Error("Target URL and database name are required (MONGO_URL / DB_NAME)");
  if (fromUrl === toUrl) throw new Error("Source and target are the same database");
  console.log(`from ${hostOf(fromUrl)} -> to ${hostOf(toUrl)} · db "${dbName}"\n`);

  const src = await MongoClient.connect(fromUrl, { serverSelectionTimeoutMS: 10000 });
  const dst = await MongoClient.connect(toUrl, { serverSelectionTimeoutMS: 10000 });
  try {
    const from = src.db(dbName);
    const to = dst.db(dbName);
    const cols = await from.listCollections({}, { nameOnly: true }).toArray();
    for (const { name } of cols) {
      if (name.startsWith("system.")) continue;
      const docs = await from.collection(name).find().toArray();
      console.log(`${apply ? "copy" : "would copy"}: ${name} (${docs.length})`);
      if (!apply) continue;
      await to.collection(name).deleteMany({});
      if (docs.length) await to.collection(name).insertMany(docs);
    }
    console.log(apply ? "\nDone." : "\nDry run. Add --apply to copy.");
  } finally {
    await src.close();
    await dst.close();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
