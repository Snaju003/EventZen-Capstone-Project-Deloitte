const helperMethods = require("./auth/helper.methods");
const authSessionMethods = require("./auth/auth-session.methods");
const authPasswordMethods = require("./auth/auth-password.methods");
const accountMethods = require("./auth/account.methods");
const adminVendorMethods = require("./auth/admin-vendor.methods");

class AuthService {
	constructor({ userModel, refreshTokenModel, passwordHasher, tokenService, emailService }) {
		this.userModel = userModel;
		this.refreshTokenModel = refreshTokenModel;
		this.passwordHasher = passwordHasher;
		this.tokenService = tokenService;
		this.emailService = emailService;
	}
}

Object.assign(
	AuthService.prototype,
	helperMethods,
	authSessionMethods,
	authPasswordMethods,
	accountMethods,
	adminVendorMethods,
);

module.exports = AuthService;
