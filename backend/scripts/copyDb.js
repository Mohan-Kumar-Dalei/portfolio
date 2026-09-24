/*
 * Copy every collection from the local database (MONGO_URL / DB_NAME in .env)
 * to another MongoDB, e.g. an Atlas cluster for the Vercel deployment.
 *
 *   node scripts/copyDb.js "<target mongodb+srv://… url>" [targetDbName]
 *
 * Dry run by default (prints what it would copy); add --apply to write.
 * Target collections are replaced, so run it once before going live.
 */
require("dotenv").config();
const { MongoClient } = require("mongoose").mongo;

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const [targetUrl, targetDbArg] = args.filter((a) => !a.startsWith("--"));

(async () => {
  if (!targetUrl) {
    console.error('Usage: node scripts/copyDb.js "<target url>" [targetDbName] [--apply]');
    process.exit(1);
  }
  const srcDbName = process.env.DB_NAME;
  const dstDbName = targetDbArg || srcDbName;
  const src = await MongoClient.connect(process.env.MONGO_URL);
  const dst = await MongoClient.connect(targetUrl);
  try {
    const from = src.db(srcDbName);
    const to = dst.db(dstDbName);
    const cols = await from.listCollections({}, { nameOnly: true }).toArray();
    for (const { name } of cols) {
      if (name.startsWith("system.")) continue;
      const docs = await from.collection(name).find().toArray();
      console.log(`${apply ? "copy" : "would copy"}: ${name} (${docs.length})`);
      if (!apply) continue;
      await to.collection(name).deleteMany({});
      if (docs.length) await to.collection(name).insertMany(docs);
    }
    console.log(apply ? `\nDone: ${srcDbName} -> ${dstDbName}` : "\nDry run. Add --apply to copy.");
  } finally {
    await src.close();
    await dst.close();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
