const { Kafka, logLevel } = require("kafkajs");

const { HANDLED_TOPICS, mapKafkaMessageToNotifications } = require("./notificationMapper");
const { createNotificationsForUsers } = require("./notification.service");

let consumer;
let isRunning = false;
let reconnectTimer = null;
let isConnecting = false;

function buildKafkaClient() {
  const brokerList = String(process.env.KAFKA_BROKER || "kafka:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);

  const brokers = brokerList.length ? brokerList : ["kafka:9092"];

  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "eventzen-notification-service",
    brokers,
    logLevel: logLevel.NOTHING,
  });
}

function parseKafkaValue(bufferValue) {
  if (!bufferValue) {
    return null;
  }

  try {
    const decoded = bufferValue.toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Skipping non-JSON kafka message:", error.message);
    return null;
  }
}

async function processKafkaMessage(topic, kafkaValue) {
  const parsed = parseKafkaValue(kafkaValue);
  if (!parsed) {
    return;
  }

  const eventType = String(parsed.eventType || topic || "").trim();
  if (!eventType) {
    return;
  }

  const mapped = await mapKafkaMessageToNotifications(eventType, parsed.payload || {}, parsed.timestamp);
  if (!mapped || !Array.isArray(mapped.userIds) || mapped.userIds.length === 0) {
    return;
  }

  const insertedCount = await createNotificationsForUsers({
    userIds: mapped.userIds,
    type: eventType,
    title: mapped.title,
    message: mapped.message,
    metadata: mapped.metadata,
    createdAt: mapped.createdAt,
  });

  if (insertedCount > 0) {
    console.log(`Stored ${insertedCount} notifications for topic ${topic}`);
  }
}

async function startKafkaConsumer() {
  if (isRunning || isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    const kafka = buildKafkaClient();
    consumer = kafka.consumer({
      groupId: process.env.KAFKA_CONSUMER_GROUP || "eventzen-notification-consumer-group",
    });

    await consumer.connect();

    for (const topic of HANDLED_TOPICS) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          await processKafkaMessage(topic, message?.value);
        } catch (error) {
          console.error(`Failed to process kafka message from ${topic}:`, error.message);
        }
      },
    });

    isRunning = true;
    isConnecting = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    console.log("Notification kafka consumer started");
  } catch (error) {
    isConnecting = false;
    isRunning = false;

    if (consumer) {
      try {
        await consumer.disconnect();
      } catch {
        // Ignore disconnect errors during degraded startup.
      }
      consumer = null;
    }

    const retryMs = Number(process.env.KAFKA_CONNECT_RETRY_MS || 5000);
    console.warn(`Kafka consumer unavailable. Retrying in ${retryMs}ms:`, error.message);

    if (!reconnectTimer) {
      reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        await startKafkaConsumer();
      }, retryMs);
    }
  }
}

async function stopKafkaConsumer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (!consumer) {
    isRunning = false;
    return;
  }

  isRunning = false;

  try {
    await consumer.disconnect();
  } catch (error) {
    console.warn("Failed to disconnect kafka consumer cleanly:", error.message);
  } finally {
    consumer = null;
  }
}

module.exports = {
  startKafkaConsumer,
  stopKafkaConsumer,
};
