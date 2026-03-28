const { hasText, normalizeText } = require("../utils/text");

function reject(res, statusCode, message) {
  return res.status(statusCode).json({
    error: message,
    statusCode,
  });
}

function requireGatewayIdentity(req, res, next) {
  const userId = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"] || "";
  const userRole = req.headers["x-user-role"];

  if (!hasText(userId) || !hasText(userRole)) {
    return reject(res, 401, "Authenticated user headers are required");
  }

  req.user = {
    id: normalizeText(userId),
    email: normalizeText(userEmail),
    role: normalizeText(userRole).toLowerCase(),
  };

  return next();
}

module.exports = {
  requireGatewayIdentity,
};
