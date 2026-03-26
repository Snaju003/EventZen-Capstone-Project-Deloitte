const { rotateCsrfCookie } = require("../utils/authCookies");
const publicHandlers = require("./auth/public.handlers");
const profileHandlers = require("./auth/profile.handlers");
const adminHandlers = require("./auth/admin.handlers");

class AuthController {
	constructor({ authService }) {
		this.authService = authService;

		this.register = this.register.bind(this);
		this.verifyOtp = this.verifyOtp.bind(this);
		this.resendOtp = this.resendOtp.bind(this);
		this.login = this.login.bind(this);
		this.refreshToken = this.refreshToken.bind(this);
		this.logout = this.logout.bind(this);
		this.getMe = this.getMe.bind(this);
		this.updateMe = this.updateMe.bind(this);
		this.deleteMe = this.deleteMe.bind(this);
		this.uploadAvatar = this.uploadAvatar.bind(this);
		this.uploadMediaImages = this.uploadMediaImages.bind(this);
		this.promoteUser = this.promoteUser.bind(this);
		this.requestVendorRole = this.requestVendorRole.bind(this);
		this.getVendorRoleRequests = this.getVendorRoleRequests.bind(this);
		this.approveVendorRoleRequest = this.approveVendorRoleRequest.bind(this);
		this.getUsersByIdsForAdmin = this.getUsersByIdsForAdmin.bind(this);
		this.getUsersByIds = this.getUsersByIds.bind(this);
		this.forgotPassword = this.forgotPassword.bind(this);
		this.verifyResetOtp = this.verifyResetOtp.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.getCsrfToken = this.getCsrfToken.bind(this);
		this.requestEmailChangeOtp = this.requestEmailChangeOtp.bind(this);
		this.verifyEmailChangeOtp = this.verifyEmailChangeOtp.bind(this);
	}

	issueCsrfToken(res) {
		const csrfToken = rotateCsrfCookie(res);
		return csrfToken;
	}
}

Object.assign(AuthController.prototype, publicHandlers, profileHandlers, adminHandlers);

module.exports = AuthController;
