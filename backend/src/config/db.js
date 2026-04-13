const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

let isConnected = false;

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (isConnected) return;

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== "production",
  });

  isConnected = true;
  logger.info("MongoDB connected");
}

module.exports = { connectDb };

