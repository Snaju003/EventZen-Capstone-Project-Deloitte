const OtpHelper = require("../../utils/otpHelper");
const { OTP_EXPIRY_MINUTES } = require("./constants");

module.exports = {
	async registerUser({ name, email, password }) {
		if (!name || !email || !password) {
			throw this.buildError(400, "name, email and password are required");
		}

		const normalizedEmail = this.normalizeEmail(email);
		const existingUser = await this.userModel.findOne({ email: normalizedEmail });

		if (existingUser) {
			throw this.buildError(409, "Email already registered");
		}

		const passwordHash = await this.passwordHasher.hashPassword(password);

		const otp = OtpHelper.generate();
		const otpHash = OtpHelper.hash(otp);
		const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

		const user = await this.userModel.create({
			name: name.trim(),
			email: normalizedEmail,
			password_hash: passwordHash,
			role: "customer",
			isVerified: false,
			otp: otpHash,
			otpExpiresAt,
		});

		await this.emailService.sendOtpEmail(user.email, otp);

		return { message: "OTP sent to your email. Please verify to complete registration." };
	},

	async verifyOtp({ email, otp }) {
		if (!email || !otp) {
			throw this.buildError(400, "email and otp are required");
		}

		const normalizedEmail = this.normalizeEmail(email);
		const user = await this.userModel.findOne({ email: normalizedEmail });

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		if (user.isVerified) {
			throw this.buildError(400, "Email is already verified");
		}

		this.assertUserHasValidOtp(user);
		this.assertOtpMatches(otp, user.otp);

		user.isVerified = true;
		user.otp = undefined;
		user.otpExpiresAt = undefined;
		await user.save();

		const tokens = await this._issueTokenPair(user);

		return {
			message: "Email verified successfully",
			...tokens,
		};
	},

	async resendOtp({ email }) {
		const normalizedEmail = this.normalizeEmail(email);
		const user = await this.userModel.findOne({ email: normalizedEmail });

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		if (user.isVerified) {
			throw this.buildError(400, "Email is already verified");
		}

		this.enforceOtpCooldown(this.getOtpIssuedAtFromExpiry(user.otpExpiresAt));

		const otp = OtpHelper.generate();
		user.otp = OtpHelper.hash(otp);
		user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		await user.save();

		await this.emailService.sendOtpEmail(user.email, otp);

		return { message: "A new OTP has been sent to your email." };
	},

	async loginUser({ email, password }) {
		if (!email || !password) {
			throw this.buildError(400, "email and password are required");
		}

		const normalizedEmail = this.normalizeEmail(email);
		const user = await this.userModel.findOne({ email: normalizedEmail });

		if (!user) {
			throw this.buildError(401, "Invalid credentials");
		}

		if (!user.isVerified) {
			throw this.buildError(403, "Please verify your email before logging in");
		}

		const isMatch = await this.passwordHasher.comparePassword(password, user.password_hash);

		if (!isMatch) {
			throw this.buildError(401, "Invalid credentials");
		}

		const tokens = await this._issueTokenPair(user);

		return {
			message: "Login successful",
			...tokens,
		};
	},

	async refreshTokens({ refreshToken }) {
		if (!refreshToken) {
			throw this.buildError(400, "refreshToken is required");
		}

		let payload;
		try {
			payload = this.tokenService.verifyRefreshToken(refreshToken);
		} catch {
			throw this.buildError(401, "Invalid or expired refresh token");
		}

		const tokenHash = OtpHelper.hash(refreshToken);
		const storedToken = await this.refreshTokenModel.findOne({ token: tokenHash, userId: payload.sub });

		if (!storedToken) {
			await this.refreshTokenModel.deleteMany({ userId: payload.sub });
			throw this.buildError(401, "Refresh token not recognised. All sessions revoked.");
		}

		await this.refreshTokenModel.deleteOne({ _id: storedToken._id });

		const user = await this.userModel.findById(payload.sub);
		if (!user) {
			throw this.buildError(404, "User not found");
		}

		const tokens = await this._issueTokenPair(user);

		return tokens;
	},

	async logout({ refreshToken }) {
		if (!refreshToken) {
			throw this.buildError(400, "refreshToken is required");
		}

		const tokenHash = OtpHelper.hash(refreshToken);
		await this.refreshTokenModel.deleteOne({ token: tokenHash });

		return { message: "Logged out successfully" };
	},
};
