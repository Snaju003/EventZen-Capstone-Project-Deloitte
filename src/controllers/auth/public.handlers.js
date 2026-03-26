const {
	clearAuthCookies,
	getRefreshTokenFromRequest,
	setAuthCookies,
} = require("../../utils/authCookies");
const { buildRequestContext, logAuditEvent } = require("../../utils/auditLogger");

module.exports = {
	async register(req, res, next) {
		try {
			const result = await this.authService.registerUser(req.body);
			logAuditEvent("auth.register.requested", {
				...buildRequestContext(req),
				email: req.body?.email,
			});
			return res.status(201).json(result);
		} catch (error) {
			logAuditEvent("auth.register.failed", {
				...buildRequestContext(req),
				email: req.body?.email,
				reason: error.message,
			});
			return next(error);
		}
	},

	async verifyOtp(req, res, next) {
		try {
			const result = await this.authService.verifyOtp(req.body);
			const { accessToken, refreshToken, ...payload } = result;
			setAuthCookies(res, { accessToken, refreshToken });
			const csrfToken = this.issueCsrfToken(res);
			return res.status(200).json({ ...payload, csrfToken });
		} catch (error) {
			return next(error);
		}
	},

	async resendOtp(req, res, next) {
		try {
			const result = await this.authService.resendOtp(req.body);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	},

	async login(req, res, next) {
		try {
			const result = await this.authService.loginUser(req.body);
			const { accessToken, refreshToken, ...payload } = result;
			setAuthCookies(res, { accessToken, refreshToken });
			const csrfToken = this.issueCsrfToken(res);
			logAuditEvent("auth.login.succeeded", {
				...buildRequestContext(req),
				email: req.body?.email,
			});
			return res.status(200).json({ ...payload, csrfToken });
		} catch (error) {
			logAuditEvent("auth.login.failed", {
				...buildRequestContext(req),
				email: req.body?.email,
				reason: error.message,
			});
			return next(error);
		}
	},

	async refreshToken(req, res, next) {
		try {
			const refreshToken = req.body?.refreshToken || getRefreshTokenFromRequest(req);
			const result = await this.authService.refreshTokens({ refreshToken });
			const {
				accessToken,
				refreshToken: nextRefreshToken,
				...payload
			} = result;

			setAuthCookies(res, { accessToken, refreshToken: nextRefreshToken });
			const csrfToken = this.issueCsrfToken(res);

			return res.status(200).json({
				message: "Token refreshed successfully",
				csrfToken,
				...payload,
			});
		} catch (error) {
			logAuditEvent("auth.refresh.failed", {
				...buildRequestContext(req),
				reason: error.message,
			});
			return next(error);
		}
	},

	async getCsrfToken(req, res) {
		const csrfToken = this.issueCsrfToken(res);
		return res.status(200).json({ csrfToken });
	},

	async logout(req, res, next) {
		try {
			const refreshToken = req.body?.refreshToken || getRefreshTokenFromRequest(req);

			if (refreshToken) {
				await this.authService.logout({ refreshToken });
			}

			clearAuthCookies(res);
			logAuditEvent("auth.logout.succeeded", {
				...buildRequestContext(req),
			});

			return res.status(200).json({ message: "Logged out successfully" });
		} catch (error) {
			logAuditEvent("auth.logout.failed", {
				...buildRequestContext(req),
				reason: error.message,
			});
			return next(error);
		}
	},

	async forgotPassword(req, res, next) {
		try {
			const result = await this.authService.forgotPassword(req.body);
			logAuditEvent("auth.password_reset.requested", {
				...buildRequestContext(req),
				email: req.body?.email,
			});
			return res.status(200).json(result);
		} catch (error) {
			logAuditEvent("auth.password_reset.request_failed", {
				...buildRequestContext(req),
				email: req.body?.email,
				reason: error.message,
			});
			return next(error);
		}
	},

	async verifyResetOtp(req, res, next) {
		try {
			const result = await this.authService.verifyResetOtp(req.body);
			logAuditEvent("auth.password_reset.otp_verified", {
				...buildRequestContext(req),
				email: req.body?.email,
			});
			return res.status(200).json(result);
		} catch (error) {
			logAuditEvent("auth.password_reset.otp_verification_failed", {
				...buildRequestContext(req),
				email: req.body?.email,
				reason: error.message,
			});
			return next(error);
		}
	},

	async resetPassword(req, res, next) {
		try {
			const result = await this.authService.resetPassword(req.user.sub, req.body);
			logAuditEvent("auth.password_reset.completed", {
				...buildRequestContext(req),
			});
			return res.status(200).json(result);
		} catch (error) {
			logAuditEvent("auth.password_reset.failed", {
				...buildRequestContext(req),
				reason: error.message,
			});
			return next(error);
		}
	},
};
