const fs = require("fs");
const path = require("path");
const OtpHelper = require("../../utils/otpHelper");
const { syncApprovedVendor } = require("../../clients/event-service.client");
const { OTP_COOLDOWN_MS, OTP_EXPIRY_MINUTES } = require("./constants");

module.exports = {
	buildError(status, message) {
		const error = new Error(message);
		error.status = status;
		return error;
	},

	buildRateLimitError(message, retryAfterSeconds) {
		const error = this.buildError(429, message);
		error.retryAfterSeconds = retryAfterSeconds;
		return error;
	},

	normalizeEmail(email, fieldName = "email") {
		if (!email || typeof email !== "string") {
			throw this.buildError(400, `${fieldName} is required`);
		}

		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail) {
			throw this.buildError(400, `${fieldName} is required`);
		}

		return normalizedEmail;
	},

	getOtpIssuedAtFromExpiry(otpExpiresAt) {
		if (!otpExpiresAt) {
			return null;
		}

		return new Date(otpExpiresAt.getTime() - OTP_EXPIRY_MINUTES * 60 * 1000);
	},

	getOtpCooldownWaitSeconds(requestedAt) {
		if (!requestedAt) {
			return 0;
		}

		const elapsed = Date.now() - requestedAt.getTime();
		if (elapsed >= OTP_COOLDOWN_MS) {
			return 0;
		}

		return Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
	},

	enforceOtpCooldown(requestedAt, { useRateLimitError = false } = {}) {
		const waitSeconds = this.getOtpCooldownWaitSeconds(requestedAt);
		if (!waitSeconds) {
			return;
		}

		const message = `Please wait ${waitSeconds} seconds before requesting a new OTP`;
		if (useRateLimitError) {
			throw this.buildRateLimitError(message, waitSeconds);
		}

		throw this.buildError(429, message);
	},

	assertUserHasValidOtp(user) {
		if (!user.otp || !user.otpExpiresAt) {
			throw this.buildError(400, "No OTP found. Please request a new one.");
		}

		if (new Date() > user.otpExpiresAt) {
			throw this.buildError(400, "OTP has expired. Please request a new one.");
		}
	},

	assertOtpMatches(otp, otpHash) {
		if (!OtpHelper.verify(otp, otpHash)) {
			throw this.buildError(400, "Invalid OTP");
		}
	},

	extractCloudinaryAvatarPublicId(avatarUrl) {
		const urlParts = avatarUrl.split("/");
		const filenameWithExtension = urlParts[urlParts.length - 1] || "";
		const publicId = filenameWithExtension.split(".")[0];
		return publicId ? `avatars/${publicId}` : null;
	},

	async removeOrphanedAvatarUpload(file) {
		if (!file?.filename) {
			return;
		}

		const cloudinary = require("../../config/cloudinary.config");
		try {
			await cloudinary.uploader.destroy(file.filename);
		} catch (err) {
			console.error("Failed to delete orphaned Cloudinary avatar:", err);
		}
	},

	async removeExistingAvatar(user) {
		if (!user?.avatar) {
			return;
		}

		try {
			if (user.avatar.includes("cloudinary.com")) {
				const publicIdWithFolder = this.extractCloudinaryAvatarPublicId(user.avatar);
				if (publicIdWithFolder) {
					const cloudinary = require("../../config/cloudinary.config");
					await cloudinary.uploader.destroy(publicIdWithFolder);
				}
				return;
			}

			if (user.avatar.startsWith("/uploads/avatars/")) {
				const oldFilename = path.basename(user.avatar);
				const oldFilePath = path.join(__dirname, "../../../uploads/avatars", oldFilename);
				if (fs.existsSync(oldFilePath)) {
					fs.unlinkSync(oldFilePath);
				}
			}
		} catch (err) {
			console.error("Failed to delete old avatar:", err);
		}
	},

	sanitizeUser(user) {
		return {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			vendorRoleStatus: user.vendorRoleStatus || "none",
			vendorRoleRequestedAt: user.vendorRoleRequestedAt || null,
			vendorRoleApprovedAt: user.vendorRoleApprovedAt || null,
			isVerified: user.isVerified,
			avatar: user.avatar,
			created_at: user.created_at,
		};
	},

	async syncApprovedVendorToVendorCollection(user, approver) {
		const syncResult = await syncApprovedVendor({ user, approver });

		if (syncResult.ok) {
			return;
		}

		if (syncResult.errorType === "config") {
			throw this.buildError(500, "EVENT_SERVICE_URL is not configured");
		}

		throw this.buildError(502, `Vendor role sync failed: ${syncResult.lastError}`);
	},

	async _issueTokenPair(user) {
		const payload = {
			sub: user._id.toString(),
			email: user.email,
			role: user.role,
		};

		const accessToken = this.tokenService.generateToken(payload);
		const refreshToken = this.tokenService.generateRefreshToken({ sub: user._id.toString() });

		const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
		await this.refreshTokenModel.create({
			token: OtpHelper.hash(refreshToken),
			userId: user._id,
			expiresAt,
		});

		return { accessToken, refreshToken };
	},
};
