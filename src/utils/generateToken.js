const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");

class JwtTokenService {
	constructor({ jwtLib = jwt, config = jwtConfig } = {}) {
		this.jwt = jwtLib;
		this.config = config;
	}

	// ── Access Token ───────────────────────────────────────────────
	generateToken(payload) {
		if (!this.config.secret) {
			throw new Error("JWT_SECRET is not configured");
		}

		return this.jwt.sign(payload, this.config.secret, {
			expiresIn: this.config.expiresIn,
		});
	}

	verifyToken(token) {
		if (!this.config.secret) {
			throw new Error("JWT_SECRET is not configured");
		}

		return this.jwt.verify(token, this.config.secret);
	}

	// ── Refresh Token ──────────────────────────────────────────────
	generateRefreshToken(payload) {
		if (!this.config.refreshSecret) {
			throw new Error("JWT_REFRESH_SECRET is not configured");
		}

		return this.jwt.sign(payload, this.config.refreshSecret, {
			expiresIn: this.config.refreshExpiresIn,
		});
	}

	verifyRefreshToken(token) {
		if (!this.config.refreshSecret) {
			throw new Error("JWT_REFRESH_SECRET is not configured");
		}

		return this.jwt.verify(token, this.config.refreshSecret);
	}
}

module.exports = JwtTokenService;
