const OtpHelper = require("../../utils/otpHelper");
const { OTP_EXPIRY_MINUTES } = require("./constants");

module.exports = {
	async forgotPassword({ email }) {
		const normalizedEmail = this.normalizeEmail(email);
		const user = await this.userModel.findOne({ email: normalizedEmail });

		if (!user) {
			return { message: "If an account with that email exists, we have sent a password reset OTP." };
		}

		this.enforceOtpCooldown(this.getOtpIssuedAtFromExpiry(user.otpExpiresAt));

		const otp = OtpHelper.generate();
		user.otp = OtpHelper.hash(otp);
		user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		await user.save();

		await this.emailService.sendPasswordResetEmail(user.email, otp);

		return { message: "If an account with that email exists, we have sent a password reset OTP." };
	},

	async verifyResetOtp({ email, otp }) {
		if (!email || !otp) {
			throw this.buildError(400, "email and otp are required");
		}

		const normalizedEmail = this.normalizeEmail(email);
		const user = await this.userModel.findOne({ email: normalizedEmail });

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		this.assertUserHasValidOtp(user);
		this.assertOtpMatches(otp, user.otp);

		user.otp = undefined;
		user.otpExpiresAt = undefined;

		if (!user.isVerified) {
			user.isVerified = true;
		}

		await user.save();

		const payload = {
			sub: user._id.toString(),
			email: user.email,
			role: user.role,
			purpose: "password_reset",
		};

		const resetToken = this.tokenService.generateToken(payload, {
			expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN || "15m",
		});

		return {
			message: "OTP verified. Use the provided token to reset your password.",
			resetToken,
		};
	},

	async resetPassword(userId, { newPassword }) {
		if (!newPassword) {
			throw this.buildError(400, "newPassword is required");
		}

		const user = await this.userModel.findById(userId);

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		const passwordHash = await this.passwordHasher.hashPassword(newPassword);

		user.password_hash = passwordHash;
		await user.save();

		await this.refreshTokenModel.deleteMany({ userId });

		return { message: "Password updated successfully. Please log in with your new password." };
	},
};
