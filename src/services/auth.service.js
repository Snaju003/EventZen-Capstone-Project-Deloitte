const OtpHelper = require("../utils/otpHelper");

const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds between resends

class AuthService {
	constructor({ userModel, refreshTokenModel, passwordHasher, tokenService, emailService }) {
		this.userModel = userModel;
		this.refreshTokenModel = refreshTokenModel;
		this.passwordHasher = passwordHasher;
		this.tokenService = tokenService;
		this.emailService = emailService;
	}

	// ── Helpers ─────────────────────────────────────────────────────

	buildError(status, message) {
		const error = new Error(message);
		error.status = status;
		return error;
	}

	sanitizeUser(user) {
		return {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified,
			created_at: user.created_at,
		};
	}

	/**
	 * Generate both access + refresh tokens and persist the refresh token.
	 */
	async _issueTokenPair(user) {
		const payload = {
			sub: user._id.toString(),
			email: user.email,
			role: user.role,
		};

		const accessToken = this.tokenService.generateToken(payload);
		const refreshToken = this.tokenService.generateRefreshToken({ sub: user._id.toString() });

		// Store hashed refresh token in DB
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
		await this.refreshTokenModel.create({
			token: OtpHelper.hash(refreshToken),
			userId: user._id,
			expiresAt,
		});

		return { accessToken, refreshToken };
	}

	// ── Register ────────────────────────────────────────────────────

	async registerUser({ name, email, password, role }) {
		if (!name || !email || !password) {
			throw this.buildError(400, "name, email and password are required");
		}

		const normalizedEmail = email.trim().toLowerCase();
		const existingUser = await this.userModel.findOne({ email: normalizedEmail });

		if (existingUser) {
			throw this.buildError(409, "Email already registered");
		}

		const passwordHash = await this.passwordHasher.hashPassword(password);

		// Generate OTP
		const otp = OtpHelper.generate();
		const otpHash = OtpHelper.hash(otp);
		const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

		const user = await this.userModel.create({
			name: name.trim(),
			email: normalizedEmail,
			password_hash: passwordHash,
			role: role || "user",
			isVerified: false,
			otp: otpHash,
			otpExpiresAt,
		});

		// Send OTP email
		await this.emailService.sendOtpEmail(user.email, otp);

		return { message: "OTP sent to your email. Please verify to complete registration." };
	}

	// ── Verify OTP ──────────────────────────────────────────────────

	async verifyOtp({ email, otp }) {
		if (!email || !otp) {
			throw this.buildError(400, "email and otp are required");
		}

		const normalizedEmail = email.trim().toLowerCase();
		const user = await this.userModel.findOne({ email: normalizedEmail });

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		if (user.isVerified) {
			throw this.buildError(400, "Email is already verified");
		}

		if (!user.otp || !user.otpExpiresAt) {
			throw this.buildError(400, "No OTP found. Please request a new one.");
		}

		if (new Date() > user.otpExpiresAt) {
			throw this.buildError(400, "OTP has expired. Please request a new one.");
		}

		if (!OtpHelper.verify(otp, user.otp)) {
			throw this.buildError(400, "Invalid OTP");
		}

		// Mark verified and clear OTP fields
		user.isVerified = true;
		user.otp = undefined;
		user.otpExpiresAt = undefined;
		await user.save();

		// Issue tokens upon successful verification
		const tokens = await this._issueTokenPair(user);

		return {
			message: "Email verified successfully",
			...tokens,
		};
	}

	// ── Resend OTP ──────────────────────────────────────────────────

	async resendOtp({ email }) {
		if (!email) {
			throw this.buildError(400, "email is required");
		}

		const normalizedEmail = email.trim().toLowerCase();
		const user = await this.userModel.findOne({ email: normalizedEmail });

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		if (user.isVerified) {
			throw this.buildError(400, "Email is already verified");
		}

		// Cooldown check — prevent spam
		if (user.otpExpiresAt) {
			const timeSinceLastOtp = Date.now() - (user.otpExpiresAt.getTime() - OTP_EXPIRY_MINUTES * 60 * 1000);
			if (timeSinceLastOtp < OTP_COOLDOWN_MS) {
				const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - timeSinceLastOtp) / 1000);
				throw this.buildError(429, `Please wait ${waitSeconds} seconds before requesting a new OTP`);
			}
		}

		const otp = OtpHelper.generate();
		user.otp = OtpHelper.hash(otp);
		user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		await user.save();

		await this.emailService.sendOtpEmail(user.email, otp);

		return { message: "A new OTP has been sent to your email." };
	}

	// ── Login ───────────────────────────────────────────────────────

	async loginUser({ email, password }) {
		if (!email || !password) {
			throw this.buildError(400, "email and password are required");
		}

		const normalizedEmail = email.trim().toLowerCase();
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
	}

	// ── Refresh Tokens ──────────────────────────────────────────────

	async refreshTokens({ refreshToken }) {
		if (!refreshToken) {
			throw this.buildError(400, "refreshToken is required");
		}

		// Verify JWT signature
		let payload;
		try {
			payload = this.tokenService.verifyRefreshToken(refreshToken);
		} catch {
			throw this.buildError(401, "Invalid or expired refresh token");
		}

		// Find the hashed token in DB
		const tokenHash = OtpHelper.hash(refreshToken);
		const storedToken = await this.refreshTokenModel.findOne({ token: tokenHash, userId: payload.sub });

		if (!storedToken) {
			// Possible token reuse attack — revoke all tokens for this user
			await this.refreshTokenModel.deleteMany({ userId: payload.sub });
			throw this.buildError(401, "Refresh token not recognised. All sessions revoked.");
		}

		// Delete the old token (rotation)
		await this.refreshTokenModel.deleteOne({ _id: storedToken._id });

		// Issue new pair
		const user = await this.userModel.findById(payload.sub);
		if (!user) {
			throw this.buildError(404, "User not found");
		}

		const tokens = await this._issueTokenPair(user);

		return tokens;
	}

	// ── Logout ──────────────────────────────────────────────────────

	async logout({ refreshToken }) {
		if (!refreshToken) {
			throw this.buildError(400, "refreshToken is required");
		}

		const tokenHash = OtpHelper.hash(refreshToken);
		await this.refreshTokenModel.deleteOne({ token: tokenHash });

		return { message: "Logged out successfully" };
	}

	// ── User CRUD (existing) ────────────────────────────────────────

	async getCurrentUser(userId) {
		const user = await this.userModel.findById(userId);

		if (!user) {
			throw this.buildError(404, "User not found");
		}

		return this.sanitizeUser(user);
	}

	async updateCurrentUser(userId, { name, email, password }) {
		const updates = {};

		if (typeof name === "string" && name.trim()) {
			updates.name = name.trim();
		}

		if (typeof email === "string" && email.trim()) {
			const normalizedEmail = email.trim().toLowerCase();
			const existingUser = await this.userModel.findOne({
				email: normalizedEmail,
				_id: { $ne: userId },
			});

			if (existingUser) {
				throw this.buildError(409, "Email already in use");
			}

			updates.email = normalizedEmail;
		}

		if (typeof password === "string" && password) {
			updates.password_hash = await this.passwordHasher.hashPassword(password);
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
	}

	async deleteCurrentUser(userId) {
		const deletedUser = await this.userModel.findByIdAndDelete(userId);

		if (!deletedUser) {
			throw this.buildError(404, "User not found");
		}

		// Clean up all refresh tokens for this user
		await this.refreshTokenModel.deleteMany({ userId });

		return { message: "User account deleted successfully" };
	}
}

module.exports = AuthService;
