const crypto = require("crypto");

class OtpHelper {
	/**
	 * Generate a 6-digit OTP using cryptographically secure randomness.
	 */
	static generate() {
		return crypto.randomInt(100000, 999999).toString();
	}

	/**
	 * Hash an OTP using SHA-256.
	 * (bcrypt is overkill for short-lived OTPs — SHA-256 is sufficient)
	 */
	static hash(otp) {
		return crypto.createHash("sha256").update(otp).digest("hex");
	}

	/**
	 * Verify a plain OTP against a SHA-256 hash.
	 */
	static verify(plainOtp, hashedOtp) {
		const hash = OtpHelper.hash(plainOtp);
		return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedOtp));
	}
}

module.exports = OtpHelper;
