const express = require("express");

const { requireGatewayIdentity } = require("../middleware/gatewayIdentity.middleware");
const {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} = require("../controllers/notification.controller");

const router = express.Router();

router.use(requireGatewayIdentity);

router.get("/notifications", getNotifications);
router.get("/notifications/unread-count", getUnreadNotificationsCount);
router.patch("/notifications/read-all", markAllNotificationsAsRead);
router.patch("/notifications/:id/read", markNotificationAsRead);

module.exports = router;
