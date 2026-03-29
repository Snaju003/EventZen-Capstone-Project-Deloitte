const { Kafka, logLevel } = require("kafkajs");

let producer;
let isConnected = false;
let connectAttempted = false;

function createKafkaClient() {
  const brokers = String(process.env.KAFKA_BROKER || "kafka:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);

  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "eventzen-payment-service",
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
    producer = createKafkaClient().producer();
  }

  if (connectAttempted && !isConnected) {
    return false;
  }

  connectAttempted = true;

  try {
    await producer.connect();
    isConnected = true;
    console.log("Payment service Kafka producer connected");
    return true;
  } catch (error) {
    console.warn("Kafka unavailable for payment-service; notifications will be skipped:", error.message);
    isConnected = false;
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
    console.warn(`Failed to publish ${eventType} from payment-service:`, error.message);
  }
}

module.exports = {
  connectKafkaProducer,
  publishNotificationEvent,
};
