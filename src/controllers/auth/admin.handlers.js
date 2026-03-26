const { buildRequestContext, logAuditEvent } = require("../../utils/auditLogger");

module.exports = {
	async promoteUser(req, res, next) {
		try {
			const result = await this.authService.promoteUserToAdmin(req.user.sub, req.params.id);
			logAuditEvent("auth.user.promoted_to_admin", {
				...buildRequestContext(req),
				targetUserId: req.params.id,
			});
			return res.status(200).json(result);
		} catch (error) {
			logAuditEvent("auth.user.promote_failed", {
				...buildRequestContext(req),
				targetUserId: req.params.id,
				reason: error.message,
			});
			return next(error);
		}
	},

	async requestVendorRole(req, res, next) {
		try {
			const result = await this.authService.requestVendorRole(req.user.sub);
			logAuditEvent("auth.vendor_role.requested", {
				...buildRequestContext(req),
			});
			return res.status(200).json(result);
		} catch (error) {
			logAuditEvent("auth.vendor_role.request_failed", {
				...buildRequestContext(req),
				reason: error.message,
			});
			return next(error);
		}
	},

	async getVendorRoleRequests(req, res, next) {
		try {
			const result = await this.authService.getPendingVendorRoleRequests(req.user.sub);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	},

	async approveVendorRoleRequest(req, res, next) {
		try {
			const result = await this.authService.approveVendorRoleRequest(req.user.sub, req.params.id);
			logAuditEvent("auth.vendor_role.approved", {
				...buildRequestContext(req),
				targetUserId: req.params.id,
			});
			return res.status(200).json(result);
		} catch (error) {
			logAuditEvent("auth.vendor_role.approval_failed", {
				...buildRequestContext(req),
				targetUserId: req.params.id,
				reason: error.message,
			});
			return next(error);
		}
	},

	async getUsersByIds(req, res, next) {
		try {
			const users = await this.authService.getUsersByIds(req.body?.userIds);
			return res.status(200).json({ users });
		} catch (error) {
			return next(error);
		}
	},

	async getUsersByIdsForAdmin(req, res, next) {
		try {
			const users = await this.authService.getUsersByIdsForAdmin(req.user.sub, req.body?.userIds);
			return res.status(200).json({ users });
		} catch (error) {
			return next(error);
		}
	},
};
