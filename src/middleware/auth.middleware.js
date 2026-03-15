class AuthMiddleware {
	constructor({ tokenService }) {
		this.tokenService = tokenService;
		this.authenticate = this.authenticate.bind(this);
	}

	authenticate(req, res, next) {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const token = authHeader.split(" ")[1];

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
}

module.exports = AuthMiddleware;
