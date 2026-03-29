const { Kafka, logLevel } = require("kafkajs");

let producer = null;
let isConnected = false;
let connectAttempted = false;

function getKafkaClient() {
  const brokers = String(process.env.KAFKA_BROKER || "kafka:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);

  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "eventzen-auth-service",
    brokers: brokers.length ? brokers : ["kafka:9092"],
    logLevel: logLevel.NOTHING,
  });
}

async function connectKafkaProducer() {
  if (isConnected) {
    return true;
  }

  if (!process.env.KAFKA_BROKER) {
    return false;
  }

  if (!producer) {
    producer = getKafkaClient().producer();
  }

  if (connectAttempted && !isConnected) {
    return false;
  }

  connectAttempted = true;

  try {
    await producer.connect();
    isConnected = true;
    console.log("Auth service Kafka producer connected");
    return true;
  } catch (error) {
    isConnected = false;
    console.warn("Kafka unavailable for auth-service; notifications will be skipped:", error.message);
    return false;
  }
}

async function publishNotificationEvent(eventType, payload) {
  const connected = await connectKafkaProducer();
  if (!connected || !producer) {
    return;
  }

  const message = {
    eventType,
    timestamp: new Date().toISOString(),
    payload: payload || {},
  };

  try {
    await producer.send({
      topic: eventType,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.warn(`Failed to publish ${eventType} from auth-service:`, error.message);
  }
}

module.exports = {
  connectKafkaProducer,
  publishNotificationEvent,
};
