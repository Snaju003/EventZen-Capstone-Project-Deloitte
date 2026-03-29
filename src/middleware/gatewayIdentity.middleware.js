function reject(res, statusCode, message) {
  return res.status(statusCode).json({
    error: message,
    statusCode,
  });
}

function requireGatewayIdentity(req, res, next) {
  const userId = String(req.headers["x-user-id"] || "").trim();
  const userRole = String(req.headers["x-user-role"] || "").trim().toLowerCase();

  if (!userId || !userRole) {
    return reject(res, 401, "Authenticated user headers are required");
  }

  req.user = {
    id: userId,
    role: userRole,
  };

  return next();
}

module.exports = {
  requireGatewayIdentity,
};
