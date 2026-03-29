const express = require("express");

const proxyConfig = require("../config/proxy.config");
const { verifyToken } = require("../middleware/jwt.middleware");
const { createServiceProxy, setGatewayIdentityHeaders } = require("../utils/proxyHelpers");

const router = express.Router();

const proxy = createServiceProxy({
  target: proxyConfig.notificationService.target,
  targets: proxyConfig.notificationService.targets,
  upstreamPrefix: "/notifications",
  serviceName: "Notification Service",
  onProxyReq: (proxyReq, req) => {
    setGatewayIdentityHeaders(proxyReq, req.user);
  },
});

router.use("/api/notifications", verifyToken, proxy);

module.exports = router;
