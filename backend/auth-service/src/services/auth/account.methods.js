const OtpHelper = require("../../utils/otpHelper");
const { OTP_COOLDOWN_SECONDS, OTP_EXPIRY_MINUTES } = require("./constants");

module.exports = {
	async getCurrentUser(userId) {
		const user = await this.userModel.findById(userId);

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		return this.sanitizeUser(user);
	},

	async updateCurrentUser(userId, { name, email, password, newPassword, currentPassword }) {
		const updates = {};

		if (typeof name === "string" && name.trim()) {
			updates.name = name.trim();
		}

		if (typeof email === "string" && email.trim()) {
			throw this.buildError(400, "Use the email verification flow to change your email address");
		}

		const desiredNewPassword =
			typeof newPassword === "string" && newPassword
				? newPassword
				: typeof password === "string" && password
					? password
					: null;

		if (desiredNewPassword) {
			if (!currentPassword) {
				throw this.buildError(400, "currentPassword is required to change password");
			}

			const userForPasswordUpdate = await this.userModel.findById(userId);
			if (!userForPasswordUpdate) {
				throw this.buildError(404, "User not found");
			}

			const isCurrentPasswordValid = await this.passwordHasher.comparePassword(
				currentPassword,
				userForPasswordUpdate.password_hash,
			);

			if (!isCurrentPasswordValid) {
				throw this.buildError(401, "Current password is incorrect");
			}

			updates.password_hash = await this.passwordHasher.hashPassword(desiredNewPassword);
		}

		if (!Object.keys(updates).length) {
			throw this.buildError(400, "No valid fields provided for update");
		}

		const user = await this.userModel.findByIdAndUpdate(userId, updates, {
			returnDocument: "after",
			runValidators: true,
		});

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		return this.sanitizeUser(user);
	},

	async requestEmailChangeOtp(userId, { newEmail }) {
		if (!newEmail || typeof newEmail !== "string") {
			throw this.buildError(400, "newEmail is required");
		}

		const user = await this.userModel.findById(userId);
		if (!user) {
			throw this.buildError(404, "User not found");
		}

		const normalizedEmail = this.normalizeEmail(newEmail, "newEmail");

		if (normalizedEmail === user.email) {
			throw this.buildError(400, "New email must be different from current email");
		}

		const existingUser = await this.userModel.findOne({
			email: normalizedEmail,
			_id: { $ne: userId },
		});

		if (existingUser) {
			throw this.buildError(409, "Email already in use");
		}

		this.enforceOtpCooldown(user.emailChangeOtpRequestedAt, { useRateLimitError: true });

		const otp = OtpHelper.generate();
		user.emailChangePendingEmail = normalizedEmail;
		user.emailChangeOtp = OtpHelper.hash(otp);
		user.emailChangeOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		user.emailChangeOtpRequestedAt = new Date();
		await user.save();

		await this.emailService.sendEmailChangeOtp(normalizedEmail, otp);

		return {
			message: "OTP sent to your new email address",
			pendingEmail: normalizedEmail,
			retryAfterSeconds: OTP_COOLDOWN_SECONDS,
		};
	},

	async verifyEmailChangeOtp(userId, { otp }) {
		if (!otp || typeof otp !== "string") {
			throw this.buildError(400, "otp is required");
		}

		const user = await this.userModel.findById(userId);
		if (!user) {
			throw this.buildError(404, "User not found");
		}

		if (!user.emailChangePendingEmail || !user.emailChangeOtp || !user.emailChangeOtpExpiresAt) {
			throw this.buildError(400, "No pending email change request found");
		}

		if (new Date() > user.emailChangeOtpExpiresAt) {
			throw this.buildError(400, "OTP has expired. Please request a new one.");
		}

		if (!OtpHelper.verify(otp, user.emailChangeOtp)) {
			throw this.buildError(400, "Invalid OTP");
		}

		const existingUser = await this.userModel.findOne({
			email: user.emailChangePendingEmail,
			_id: { $ne: userId },
		});

		if (existingUser) {
			throw this.buildError(409, "Email already in use");
		}

		user.email = user.emailChangePendingEmail;
		user.emailChangePendingEmail = undefined;
		user.emailChangeOtp = undefined;
		user.emailChangeOtpExpiresAt = undefined;
		user.emailChangeOtpRequestedAt = undefined;
		await user.save();

		return {
			message: "Email updated successfully",
			user: this.sanitizeUser(user),
		};
	},

	async deleteCurrentUser(userId) {
		const deletedUser = await this.userModel.findByIdAndDelete(userId);

		if (!deletedUser) {
			throw this.buildError(404, "User not found");
		}

		await this.refreshTokenModel.deleteMany({ userId });

		return { message: "User account deleted successfully" };
	},

	async uploadAvatar(userId, file) {
		if (!file) {
			throw this.buildError(400, "No image file provided");
		}

		const user = await this.userModel.findById(userId);
		if (!user) {
			await this.removeOrphanedAvatarUpload(file);
			throw this.buildError(404, "User not found");
		}

		const avatarUrl = file.path;

		await this.removeExistingAvatar(user);

		user.avatar = avatarUrl;
		await user.save();

		return this.sanitizeUser(user);
	},
};
