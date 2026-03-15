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
	}

	async register(req, res, next) {
		try {
			const result = await this.authService.registerUser(req.body);
			return res.status(201).json(result);
		} catch (error) {
			return next(error);
		}
	}

	async verifyOtp(req, res, next) {
		try {
			const result = await this.authService.verifyOtp(req.body);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}

	async resendOtp(req, res, next) {
		try {
			const result = await this.authService.resendOtp(req.body);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}

	async login(req, res, next) {
		try {
			const result = await this.authService.loginUser(req.body);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}

	async refreshToken(req, res, next) {
		try {
			const result = await this.authService.refreshTokens(req.body);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}

	async logout(req, res, next) {
		try {
			const result = await this.authService.logout(req.body);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}

	async getMe(req, res, next) {
		try {
			const user = await this.authService.getCurrentUser(req.user.sub);
			return res.status(200).json({ user });
		} catch (error) {
			return next(error);
		}
	}

	async updateMe(req, res, next) {
		try {
			const user = await this.authService.updateCurrentUser(req.user.sub, req.body);
			return res.status(200).json({
				message: "User updated successfully",
				user,
			});
		} catch (error) {
			return next(error);
		}
	}

	async deleteMe(req, res, next) {
		try {
			const result = await this.authService.deleteCurrentUser(req.user.sub);
			return res.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}
}

module.exports = AuthController;
