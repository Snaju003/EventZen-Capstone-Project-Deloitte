const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const app = require("./app");
const { connectToDatabase } = require("./config/database");
const { startKafkaConsumer, stopKafkaConsumer } = require("./services/kafkaConsumer");

const PORT = Number(process.env.PORT) || 3003;

async function bootstrap() {
  try {
    await connectToDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Notification Service running on port ${PORT}`);
    });

    // Start Kafka consumer in the background — don't block the HTTP server
    startKafkaConsumer().catch((err) => {
      console.warn("Kafka consumer initial connect failed (will keep retrying):", err.message);
    });

    const shutdown = async () => {
      await stopKafkaConsumer();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start Notification Service:", error.message);
    process.exit(1);
  }
}

bootstrap();
