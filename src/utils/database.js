const mongoose = require("mongoose");

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI not configured. Revenue tracking will be disabled.");
    console.warn("Set MONGODB_URI in .env file to enable revenue tracking.");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("Payment Service connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

function isDatabaseConnected() {
  const connected = isConnected && mongoose.connection.readyState === 1;
  return connected;
}

module.exports = {
  connectToDatabase,
  isDatabaseConnected,
};
