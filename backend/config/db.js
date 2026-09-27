const dns = require("dns");
const mongoose = require("mongoose");

// Some Windows / ISP resolvers refuse the SRV lookup that mongodb+srv:// URLs
// need ("querySrv ECONNREFUSED") even though the OS itself resolves it. On
// that specific failure, retry once through public DNS.
const isSrvLookupError = (err) => /querySrv|ENOTFOUND|ECONNREFUSED/.test(String(err?.message)) && /_mongodb\._tcp/.test(String(err?.message));

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;
  if (!mongoUrl || !dbName) {
    throw new Error("MONGO_URL and DB_NAME must be set in environment");
  }
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(mongoUrl, { dbName });
  } catch (err) {
    if (!isSrvLookupError(err)) throw err;
    console.warn("[db] SRV lookup failed with the system resolver, retrying via public DNS");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(mongoUrl, { dbName });
  }
  console.log(`[db] Connected to MongoDB database: ${dbName}`);
};

module.exports = connectDB;
