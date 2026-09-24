const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;
  if (!mongoUrl || !dbName) {
    throw new Error("MONGO_URL and DB_NAME must be set in environment");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUrl, { dbName });
  console.log(`[db] Connected to MongoDB database: ${dbName}`);
};

module.exports = connectDB;
