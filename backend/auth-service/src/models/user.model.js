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
			default: "customer",
		},
		vendorRoleStatus: {
			type: String,
			required: true,
			default: "none",
			enum: ["none", "pending", "approved"],
		},
		vendorRoleRequestedAt: {
			type: Date,
		},
		vendorRoleApprovedAt: {
			type: Date,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		avatar: {
			type: String,
			default: "",
		},
		otp: {
			type: String, // stored as SHA-256 hash
		},
		otpExpiresAt: {
			type: Date,
		},
		emailChangePendingEmail: {
			type: String,
			lowercase: true,
			trim: true,
			match: [EMAIL_REGEX, "Please enter a valid email address"],
		},
		emailChangeOtp: {
			type: String,
		},
		emailChangeOtpExpiresAt: {
			type: Date,
		},
		emailChangeOtpRequestedAt: {
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

