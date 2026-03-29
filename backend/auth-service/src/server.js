// src/server.js
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
require("dotenv").config({ path: ".env.local", override: true });

const app = require("./app");
const connectDB = require("./config/db.config");
const { connectKafkaProducer } = require("./utils/kafkaProducer");

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    await connectKafkaProducer();

    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start service:", error.message);
    process.exit(1);
  }
};

startServer();
