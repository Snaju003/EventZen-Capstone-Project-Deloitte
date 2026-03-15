const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
	{
		token: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: { createdAt: "createdAt", updatedAt: false },
		versionKey: false,
	}
);

// Automatically delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Fast lookup by userId (for cleanup on logout)
refreshTokenSchema.index({ userId: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema, "REFRESH_TOKENS");

module.exports = RefreshToken;
