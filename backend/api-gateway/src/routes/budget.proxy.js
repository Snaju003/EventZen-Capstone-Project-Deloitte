const express = require("express");

const proxyConfig = require("../config/proxy.config");
const { verifyToken, authorizeRoles } = require("../middleware/jwt.middleware");
const { createServiceProxy, setGatewayIdentityHeaders } = require("../utils/proxyHelpers");

const router = express.Router();
const requireAdminOrVendor = authorizeRoles("admin", "vendor");

const proxy = createServiceProxy({
  target: proxyConfig.budgetService.target,
  targets: proxyConfig.budgetService.targets,
  upstreamPrefix: "/budget",
  serviceName: "Budget Service",
  onProxyReq: (proxyReq, req) => {
    setGatewayIdentityHeaders(proxyReq, req.user);
  },
});

router.use("/api/budget", verifyToken, requireAdminOrVendor, proxy);

module.exports = router;
