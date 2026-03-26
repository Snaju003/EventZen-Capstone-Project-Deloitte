module.exports = {
	async promoteUserToAdmin(requesterId, targetUserId) {
		const requester = await this.userModel.findById(requesterId);
		if (!requester) {
			throw this.buildError(404, "Requester not found");
		}

		if (requester.role !== "admin") {
			throw this.buildError(403, "Only admins can promote users");
		}

		const targetUser = await this.userModel.findById(targetUserId);
		if (!targetUser) {
			throw this.buildError(404, "Target user not found");
		}

		targetUser.role = "admin";
		await targetUser.save();

		return {
			message: "User promoted to admin successfully",
			user: this.sanitizeUser(targetUser),
		};
	},

	async requestVendorRole(userId) {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw this.buildError(404, "User not found");
		}

		const normalizedRole = (user.role || "").toLowerCase();
		if (normalizedRole === "admin") {
			throw this.buildError(400, "Admin users cannot request vendor role");
		}

		if (normalizedRole === "vendor") {
			throw this.buildError(400, "You already have vendor access");
		}

		if (user.vendorRoleStatus === "pending") {
			throw this.buildError(409, "Vendor role request is already pending approval");
		}

		user.vendorRoleStatus = "pending";
		user.vendorRoleRequestedAt = new Date();
		user.vendorRoleApprovedAt = undefined;
		await user.save();

		return {
			message: "Vendor role request submitted successfully",
			user: this.sanitizeUser(user),
		};
	},

	async getPendingVendorRoleRequests(requesterId) {
		const requester = await this.userModel.findById(requesterId);
		if (!requester) {
			throw this.buildError(404, "Requester not found");
		}

		if ((requester.role || "").toLowerCase() !== "admin") {
			throw this.buildError(403, "Only admins can view vendor role requests");
		}

		const pendingUsers = await this.userModel
			.find({ vendorRoleStatus: "pending" })
			.sort({ vendorRoleRequestedAt: 1, created_at: 1 });

		return {
			requests: pendingUsers.map((user) => this.sanitizeUser(user)),
		};
	},

	async approveVendorRoleRequest(requesterId, targetUserId) {
		const requester = await this.userModel.findById(requesterId);
		if (!requester) {
			throw this.buildError(404, "Requester not found");
		}

		if ((requester.role || "").toLowerCase() !== "admin") {
			throw this.buildError(403, "Only admins can approve vendor role requests");
		}

		const targetUser = await this.userModel.findById(targetUserId);
		if (!targetUser) {
			throw this.buildError(404, "Target user not found");
		}

		if (targetUser.vendorRoleStatus !== "pending") {
			throw this.buildError(400, "Target user does not have a pending vendor role request");
		}

		await this.syncApprovedVendorToVendorCollection(targetUser, requester);

		targetUser.role = "vendor";
		targetUser.vendorRoleStatus = "approved";
		targetUser.vendorRoleApprovedAt = new Date();
		await targetUser.save();

		return {
			message: "Vendor role approved successfully",
			user: this.sanitizeUser(targetUser),
		};
	},

	async getUsersByIdsForAdmin(requesterId, userIds) {
		const requester = await this.userModel.findById(requesterId);
		if (!requester) {
			throw this.buildError(404, "Requester not found");
		}

		if ((requester.role || "").toLowerCase() !== "admin") {
			throw this.buildError(403, "Only admins can fetch user details");
		}

		return this.getUsersByIds(userIds);
	},

	async getUsersByIds(userIds) {
		if (!Array.isArray(userIds)) {
			throw this.buildError(400, "userIds must be an array");
		}

		const normalizedIds = [...new Set(userIds.filter((id) => typeof id === "string" && id.trim()).map((id) => id.trim()))];

		if (!normalizedIds.length) {
			return [];
		}

		const users = await this.userModel
			.find({ _id: { $in: normalizedIds } })
			.select("_id name email")
			.lean();

		return users.map((user) => ({
			id: user._id.toString(),
			name: user.name,
			email: user.email,
		}));
	},

	async uploadMediaImages(requester, files, folder) {
		if (!requester?.sub) {
			throw this.buildError(401, "Unauthorized");
		}

		const requesterRole = (requester.role || "").toLowerCase();
		if (!requesterRole) {
			throw this.buildError(403, "Role is required to upload images");
		}

		if (!Array.isArray(files) || files.length === 0) {
			throw this.buildError(400, "No image files provided");
		}

		const allowedFolders = new Set(["events", "venues"]);
		const normalizedFolder = typeof folder === "string" ? folder.trim().toLowerCase() : "";
		const safeFolder = allowedFolders.has(normalizedFolder) ? normalizedFolder : "events";

		if (requesterRole === "vendor" && safeFolder !== "events") {
			throw this.buildError(403, "Vendors can only upload event images");
		}

		if (requesterRole !== "admin" && requesterRole !== "vendor") {
			throw this.buildError(403, "Only admins and vendors can upload event images");
		}

		const images = files
			.map((file) => ({
				url: file.path,
				publicId: file.filename,
			}))
			.filter((image) => typeof image.url === "string" && image.url.trim());

		if (!images.length) {
			throw this.buildError(500, "Cloudinary upload succeeded but no image URLs were returned");
		}

		return {
			message: "Images uploaded successfully",
			folder: safeFolder,
			images,
		};
	},
};
