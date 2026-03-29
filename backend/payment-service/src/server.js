require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = require("./app");
const { connectToDatabase } = require("./utils/database");
const { connectKafkaProducer } = require("./utils/kafkaProducer");

const PORT = Number(process.env.PORT) || 3002;

async function startServer() {
  await connectToDatabase();
  await connectKafkaProducer();

  app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
  });
}

startServer();
