const mongoose = require("mongoose");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			match: [EMAIL_REGEX, "Please enter a valid email address"],
		},
		password_hash: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			required: true,
			default: "user",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		otp: {
			type: String, // stored as SHA-256 hash
		},
		otpExpiresAt: {
			type: Date,
		},
		created_at: {
			type: Date,
			default: Date.now,
		},
	},
	{
		versionKey: false,
	}
);

const User = mongoose.model("User", userSchema, "USERS");

module.exports = User;

