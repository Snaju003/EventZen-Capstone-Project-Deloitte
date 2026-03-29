const mongoose = require("mongoose");

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);
  console.log("Notification Service connected to MongoDB");
}

module.exports = {
  connectToDatabase,
};
