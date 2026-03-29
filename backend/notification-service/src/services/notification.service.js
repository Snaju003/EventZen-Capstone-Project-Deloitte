const mongoose = require("mongoose");

const Notification = require("../models/notification.model");

function normalizePagination(query) {
  const page = Math.max(Number.parseInt(query?.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query?.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function toNotificationResponse(doc) {
  return {
    id: String(doc._id),
    userId: doc.userId,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    metadata: doc.metadata || {},
    isRead: Boolean(doc.isRead),
    createdAt: doc.createdAt,
  };
}

async function listUserNotifications(userId, query) {
  const { page, limit, skip } = normalizePagination(query);

  const filter = { userId };

  // Support filtering by read status
  if (query?.unread === "true") {
    filter.isRead = false;
  } else if (query?.read === "true") {
    filter.isRead = true;
  }

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    items: items.map(toNotificationResponse),
    pagination: {
      page,
      limit,
      total,
      pages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
}

async function getUnreadCount(userId) {
  return Notification.countDocuments({
    userId,
    isRead: false,
  });
}

async function markOneAsRead(userId, notificationId) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return null;
  }

  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true },
  ).lean();

  return updated ? toNotificationResponse(updated) : null;
}

async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } },
  );

  return Number(result?.modifiedCount || 0);
}

async function createNotificationsForUsers({ userIds, type, title, message, metadata, createdAt }) {
  const normalizedUserIds = [...new Set((userIds || []).map((id) => String(id || "").trim()).filter(Boolean))];
  if (!normalizedUserIds.length) {
    return 0;
  }

  const docs = normalizedUserIds.map((userId) => ({
    userId,
    type,
    title,
    message,
    metadata: metadata || {},
    isRead: false,
    createdAt: createdAt || new Date(),
  }));

  const inserted = await Notification.insertMany(docs, { ordered: false });
  return inserted.length;
}

module.exports = {
  createNotificationsForUsers,
  getUnreadCount,
  listUserNotifications,
  markAllAsRead,
  markOneAsRead,
};
