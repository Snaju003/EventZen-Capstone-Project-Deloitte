const {
  getUnreadCount,
  listUserNotifications,
  markAllAsRead,
  markOneAsRead,
} = require("../services/notification.service");

function getRequesterId(req) {
  return String(req.user?.id || "").trim();
}

async function getNotifications(req, res, next) {
  try {
    const userId = getRequesterId(req);
    const result = await listUserNotifications(userId, req.query);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getUnreadNotificationsCount(req, res, next) {
  try {
    const userId = getRequesterId(req);
    const unreadCount = await getUnreadCount(userId);
    return res.status(200).json({ unreadCount });
  } catch (error) {
    return next(error);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const userId = getRequesterId(req);
    const updated = await markOneAsRead(userId, req.params.id);

    if (!updated) {
      return res.status(404).json({
        error: "Notification not found",
        statusCode: 404,
      });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
}

async function markAllNotificationsAsRead(req, res, next) {
  try {
    const userId = getRequesterId(req);
    const modifiedCount = await markAllAsRead(userId);
    return res.status(200).json({ modifiedCount });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
};
