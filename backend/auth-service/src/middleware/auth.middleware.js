const { getAccessTokenFromRequest } = require("../utils/authCookies");

class AuthMiddleware {
	constructor({ tokenService }) {
		this.tokenService = tokenService;
		this.authenticate = this.authenticate.bind(this);
		this.authenticateResetToken = this.authenticateResetToken.bind(this);
	}

	authenticate(req, res, next) {
		const authHeader = req.headers.authorization;
		const bearerToken = authHeader?.startsWith("Bearer ")
			? authHeader.split(" ")[1]
			: null;
		const cookieToken = getAccessTokenFromRequest(req);
		const token = bearerToken || cookieToken;

		if (!token) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		try {
			const payload = this.tokenService.verifyToken(token);
			req.user = payload;
			return next();
		} catch (error) {
			if (error.message === "JWT_SECRET is not configured") {
				return res.status(500).json({ message: error.message });
			}

			return res.status(401).json({ message: "Invalid or expired token" });
		}
	}

	authenticateResetToken(req, res, next) {
		const authHeader = req.headers.authorization;
		const token = authHeader?.startsWith("Bearer ")
			? authHeader.split(" ")[1]
			: null;

		if (!token) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		try {
			const payload = this.tokenService.verifyToken(token);

			if (payload?.purpose !== "password_reset") {
				return res.status(403).json({ message: "Forbidden" });
			}

			req.user = payload;
			return next();
		} catch (error) {
			if (error.message === "JWT_SECRET is not configured") {
				return res.status(500).json({ message: error.message });
			}

			return res.status(401).json({ message: "Invalid or expired token" });
		}
	}
}

module.exports = AuthMiddleware;
